/* eslint no-use-before-define: 0 */
/* @flow */
import { connect } from './xmpp';
import log from 'winston';
import { config, bus } from '../../core-server';
// import util from 'util';
let client;


function sendUpstreamMessage (upStanza, type, cb) {
	const stnza =
	`<message>
		<gcm xmlns="google:mobile:data">
			{
					"to":"${upStanza.from}",
					"message_id":"${upStanza.message_id}"
					"message_type": "${type}"
			}
		</gcm>
	</message>`;

	log.info('Sending ' + type + ' message: ', stnza);
	client.send(stnza);
	if (cb) cb();
}
function updateUser(u) {
	if (!u.data.sessionId && !u.data.tken) return;
	bus.emit('change', {
		auth: {
			session: u.data.sessionId
		}
	}, (err, changes) => {
		if (err) {
			log.error('error on auth user to save token: ', err);
			sendUpstreamMessage(u, 'NACK', connectToXMPP);
		} else {
			log.info('update user with token');
			const user = changes.response.entities[changes.response.state.user];

			(user.params.gcm = user.params.gcm || {})[u.data.uuid] = u.data.token;
			bus.emit('change', {
				entities: {
					[user.id]: user
				}
			}, (e) => {
				if (e) log.debug(e);
				else {
					sendUpstreamMessage(u, 'ACK');
				}
			});
		}
	});
}
function handleStanza(stanza) {
	log.info('stanza received');
	const st = stanza.toJSON();
	let x;

	log.info('stanza: ', st);

	if (st.children && st.children[0] && st.children[0].children) {
		x = JSON.parse(st.children[0].children[0]);
	}
	if (x && x.category === config.gcm.packageName) {
		log.info('Handle upstream message: ', x);
		updateUser(x);
	}
}
function connectToXMPP() {
	connect((e, c) => {
		if (e) log.debug(e);
		else {
			client = c;
			log.info('XMPP client connected');
			c.on('stanza', handleStanza);
		}
	});
}

if (config.gcm.senderId) {
	connectToXMPP();
}
