/* @flow */

import eio from 'engine.io-client/engine.io';
import { bus, config } from '../../core-client.js';
import * as models from '../../models/models.js';
import stringpack from 'stringpack';

const protocol = config.server.protocol, host = config.server.apiHost;
let	backOff = 1, client;

const packer = stringpack(Object.keys(models).sort().map(key => models[key]));

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

	changes.source = 'server';

	bus.emit('change', changes);
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

bus.on('change', (changes) => {
	if (changes.source === 'server') return;

	const { state, ...filtered } = changes;

	if (Object.keys(filtered).length) {
		client.send(packer.encode(filtered));
	}
}, 1);

connect();
