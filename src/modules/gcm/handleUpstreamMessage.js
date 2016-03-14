/* eslint no-use-before-define: 0 */
/* @flow */
import log from 'winston';
import { config, bus } from '../../core-server';
import { subscribe } from './subscribeTopics';
// import util from 'util';
let client, userToken, userSession;

export function getTokenAndSession() {
	if (!userToken && !userSession) {
		log.info('no token or session found');
		return { error: 'NO_TOKEN_AND_SESSION' };
	}
	return {
		token: userToken,
		sessionId: userSession
	};
}

function saveTokenAndSession(token, sessionId) {
	log.debug('token and session saved');
	userToken = token;
	userSession = sessionId;
}

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
export function updateUser(u, cb) {
	if (!u.data.sessionId && !u.data.token) {
		console.log('no data token and session found to update user');
		return;
	}
	bus.emit('change', {
		auth: {
			session: u.data.sessionId
		}
	}, (err, changes) => {
		if (err) {
			log.error('error on auth user: ', err, u.data.sessionId);
			saveTokenAndSession(u.data.token, u.data.sessionId);
			sendUpstreamMessage(u, 'NACK');
			if (cb) cb(err);
		} else {
			log.info('update user with token');
			const user = changes.response.entities[changes.response.state.user];

			(user.params.gcm = user.params.gcm || {})[u.data.uuid] = u.data.token;
			bus.emit('change', {
				entities: {
					[user.id]: user
				}
			}, (e) => {
				if (e) {
					log.debug('error on saving token: ', e);
					if (cb) cb(e);
				} else {
					sendUpstreamMessage(u, 'ACK', () => {
						log.info('subscribing user: ', user.id, 'for mention');
						subscribe({
							params: user.params || {},
							topic: 'mention-' + user.id
						});
						if (cb) cb(null);
					});
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
	// console.log("x: ", x)
	if (x && x.category === config.gcm.packageName) {
		log.info('Handle upstream message: ', x);
		updateUser(x);
	}
}

export default function(c) {
	client = c;
	client.on('stanza', handleStanza);
}
