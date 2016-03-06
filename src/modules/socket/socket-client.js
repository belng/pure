/* @flow */

import eio from 'engine.io-client';
import { bus, config } from '../../core-client.js';
import packer from './../../lib/packer';

const {
	protocol,
	host,
} = config.server;

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
	const frame = packer.decode(message);

	frame.message.source = 'server';
	bus.emit(frame.type, frame.message);
}

function connect() {
	client = new eio.Socket((protocol === 'https:' ? 'wss:' : 'ws:') + '//' + host, {
		jsonp: 'document' in window && 'createElement' in window.document // Disable JSONP in non-web environments, e.g.- react-native
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

bus.on('state:init', state => {
	state.connectionStatus = 'connecting';
	connect();
});

bus.on('postchange', changes => {
	if (changes.source === 'server') return;
	if (changes.queries || changes.entities) {
		client.send(packer.encode({
			queries: changes.queries,
			entities: changes.entities
		}));
	}
});
