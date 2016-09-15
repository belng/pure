/* eslint no-use-before-define: 0 */
/* @flow */
import Client from 'node-xmpp-client';
import Logger from '../../lib/logger';
import { config } from '../../core-server';

let backOff = 1, client;
const options = {
		type: 'client',
		jid: config.gcm.senderId + '@gcm.googleapis.com',
		password: config.gcm.apiKey,
		host: config.gcm.domain,
		port: config.gcm.port,
		reconnect: true,
		legacySSL: true,
		preferred: 'PLAIN',
	}, log = new Logger(__filename);


function onStanza (s) {
	const st = s.toJSON();
	let x;

	log.info('stanza: ', st);

	if (st.children && st.children[0] && st.children[0].children) {
		x = JSON.parse(st.children[0].children[0]);
	}

	if (x && x.message_type === 'nack') {
		setTimeout(connect, backOff * 1000);
		backOff *= 2;
		if (backOff > 128) backOff = 128;
	}
}
function onOnline (d) {
	log.info('XMPP client online');
	log.info('data: ', d);
}

function onError(e) {
	log.error('error: ', e);
}

function handleOffline (info) {
	log.info('went offline: ', info);
}

function reconnect (e) {
	log.info('XMPP client disconnected ', e);
}

export default function connect (cb: Function) {
	log.info('connecting.....');

	try {
		client = new Client(options);
		client.connection.socket.setTimeout(0);
		client.connection.socket.setKeepAlive(true, 10000);
		client.on('online', onOnline);
		client.on('error', onError);
		client.on('stanza', onStanza);
		client.on('offline', handleOffline);
		client.on('disconnect', reconnect);

		if (cb) cb(null, client);
	} catch (e) {
		if (cb) cb(e, null);
	}
}
