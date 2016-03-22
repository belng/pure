/* @flow */

import { bus, config } from '../../core-client.js';
import packer from './../../lib/packer';

const {
	protocol,
	host,
} = config.server;

const poll = 'document' in window && 'createElement' in window.document; // Disable polling in non-web environments, e.g.- react-native

// engine.io needs the userAgent string to be present
if (!global.navigator.userAgent) {
	global.navigator.userAgent = 'React Native';
}

const eio = require('engine.io-client'); // eslint-disable-line import/no-commonjs

let	backOff = 1, client;

function disconnected() {

	/* eslint-disable no-use-before-define */

	if (backOff < 256) {
		backOff *= 2;
	} else {
		backOff = 256;
	}

	bus.emit('change', {
		state: { connectionStatus: 'offline', backOff }
	});

	setTimeout(connect, backOff * 1000);
}

function onMessage(message) {
	// console.log('frame: -->', message);
	const frame = packer.decode(message);

	// console.log('-->', frame);

	frame.message.source = 'server';
	bus.emit(frame.type, frame.message);
}

function connect() {

	client = new eio.Socket((protocol === 'https:' ? 'wss:' : 'ws:') + '//' + host, {
		jsonp: poll,
		transports: poll ? [ 'polling', 'websocket' ] : [ 'websocket' ]
	});

	client.on('close', disconnected);

	client.on('open', () => {
		backOff = 1;
		bus.emit('change', {
			state: { connectionStatus: 'online', backOff }
		});
	});

	client.on('message', onMessage);
}

const props = [ 'queries', 'entities', 'auth' ];

bus.on('postchange', changes => {
	if (changes.source === 'server') return;

	const frame = {};

	for (let i = 0, l = props.length; i < l; i++) {
		const prop = props[i];

		if (changes[prop]) {
			frame[prop] = changes[prop];
		}
	}

	if (Object.keys(frame).length) {
		console.log('<--', frame);
		client.send(packer.encode({
			type: 'change',
			message: frame
		}));
	}
});

bus.on('state:init', state => {
	state.connectionStatus = 'connecting';
	connect();
});
