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
	const st = s.toJSON();
	let x;

	log.info('stanza: ', st);

	if (st.children && st.children[0] && st.children[0].children) {
		x = JSON.parse(st.children[0].children[0]);
	}

	if (x && x.message_type === 'nack') {
		setTimeout(gcm, backOff * 1000);
		backOff *= 2;
		if (backOff > 128) backOff = 128;
	}
}

export function connect (cb: Function) {
	log.info('connecting.....');
	try {
		client = new Client(options);
		cb(null, client);
	} catch (e) {
		cb(e, null);
	}
}

function onOnline (d) {
	log.info('client online');
	log.info('data: ', d);

	client.send(createStanza(stanza));
}

function onError(e) {
	log.error('error: ', e);
}

export default function gcm (note: Object) {
	stanza = note;
	connect((err) => {
		if (err) log.debug(err);
		else {
			log.info('XMPP client connetced.');
		}
	});

	client.on('online', onOnline);
	client.on('error', onError);
	client.on('stanza', onStanza);
}
