/* @flow */

import EnhancedError from '../../lib/EnhancedError';
import eio from 'engine.io-client';
import { bus, config } from '../../core-client.js';
import * as models from '../../models/models.js';
import stringPack from 'stringpack';

const packerArg = Object.keys(models).sort().map(key => models[key]);

packerArg.push(EnhancedError);
const packer = stringPack(packerArg);

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
	const changes = packer.decode(message);

	changes.message.source = 'server';
	bus.emit(changes.type, changes.message);
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

bus.on('change', changes => {
	if (changes.source === 'server') return;

	const { state, ...filtered } = changes;

	if (Object.keys(filtered).length) {
		client.send(packer.encode(filtered));
	}
}, 1);

bus.on('state:init', state => {
	state.connectionStatus = 'connecting';
	connect();
});
