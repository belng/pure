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

function updateUser() {

}

function onStanza (s) {
	const st = s.toJSON();
	let x, type;

	log.info('stanza: ', st);

	if (st.children && st.children[0] && st.children[0].children) {
		x = JSON.parse(st.children[0].children[0]);
		type = x.message_type;
		console.log('x:', x);
		console.log('category: ', x.category, config.gcm.packageName)
	}

	if (type === 'nack') {
		setTimeout(gcm, backOff * 1000);
		backOff *= 2;
		if (backOff > 128) backOff = 128;
	}

	if (x && x.category === config.gcm.packageName) {
		log.info('Handle upstream message');
		handleUpstreamMessage(x, updateUser);
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

function handleUpstreamMessage (upStanza, cb) {
console.log(upStanza);
	const stnza = `<message>
		<gcm xmlns="google:mobile:data">
			{
					"to":${upStanza.from},
					"message_id":${upStanza.message_id}
					"message_type":"ack"
			}
		</gcm>
	</message>`;

	log.info('Sending ACK message');
	console.log(stnza);
	client.send(stnza);
	cb();
}
