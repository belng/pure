/* eslint no-use-before-define: 0 */
/* @flow */
import Client from 'node-xmpp-client';
import log from 'winston';
import { config } from '../../core-server';
import createStanza from './createStanza';
let client, stanza, backOff = 1;
const options = {
	type: 'client',
	jid: config.gcm.senderId + '@gcm.googleapis.com',
	password: config.gcm.apiKey,
	host: config.gcm.domain,
	port: config.gcm.port,
	reconnect: false,
	legacySSL: true,
	preferred: 'PLAIN'
};

function onStanza (s) {
	log.info('stanza: ', s.toJSON());
	const x = JSON.parse(s.toJSON().children[0].children[0]),
		type = x.message_type;

	if (type === 'nack') {
		setTimeout(gcm, backOff * 1000);
		backOff *= 2;
		if (backOff > 128) backOff = 128;
	}
}

function connect () {
	log.info('connecting.....');
	client = new Client(options);
}

function onOnline (d) {
	log.info('client online');
	log.info('data: ', d);

	client.send(createStanza(stanza));
}

function onError(e) {
	log.error('error: ', e);
}

export default function gcm (note) {
	stanza = note;
	connect();

	client.on('online', onOnline);
	client.on('error', onError);
	client.on('stanza', onStanza);
}
