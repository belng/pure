/* @flow */
import { config, bus, Constants, cache } from '../../core-server';
import Counter from '../../lib/counter';
import log from 'winston';
import values from 'lodash/values';
import request from 'request';
import { getTokenAndSession, updateUser } from './handleUpstreamMessage';
const authKey = 'key=' + config.gcm.apiKey;
const options = {
	url: 'https://iid.googleapis.com/iid/v1:batchAdd',
	json: true,
	method: 'POST',
	headers: {
		Authorization: authKey
	},
	body: {}
};

function getIIDInfo(iid, cb) {
	request({
		url: `https://iid.googleapis.com/iid/info/${iid}?details=true`,
		method: 'GET',
		headers: {
			Authorization: authKey
		},
	}, cb);
}

function unsubscribeTopics (iid, cb) {
	getIIDInfo(iid, async (e, r, b) => {
		if (e) {
			log.error(e);
			return;
		}
		try {
			// unsubscribe thread topics
			await Object.keys(JSON.parse(b).rel.topics).map(topic => {
				if (!/thread-/.test(topic)) {
					log.debug('does not match thread');
					return null;
				}

				return new Promise((resolve, reject) => {
					request({
						...options,
						url: 'https://iid.googleapis.com/iid/v1:batchRemove',
						body: {
							registration_tokens: [ iid ],
							to: '/topics/' + topic
						}
					}, (err, rspns, bdy) => {
						if (!err) {
							log.info('unsubscribed from ', topic);
							log.info(bdy);
							resolve();
						} else {
							log.error(err);
							reject(err);
						}
					});
				});
			});
		} catch (err) {
			// ignore
		}
		cb();
	});
}

export function subscribe (userRel: Object) {
	const gcm = userRel.params.gcm;

	function register () {
		const	tokens = values(gcm);

		log.info('tokens: ', tokens);
		tokens.forEach(token => {
			request({
				...options,
				body: {
					registration_tokens: [ token ],
					to: '/topics/' + userRel.topic
				}
			}, (error, response, body) => {
				if (error) {
					log.error(error);
					if (error.type === 'TOO_MANY_TOPICS') {
						log.info('unsubscribe few old topics');
						unsubscribeTopics(token, () => {
							subscribe(userRel);
						});
					} else {
						log.error('can not subscribe to topic', error);
					}
				}
				if (body.error) {
					log.error(body);
					// console.log(options);
				} else {
					log.info('succefully subscribed to: ' + userRel.topic, body);
					getIIDInfo(token, (e, r, b) => {
						log.info(b);
						return;
					});
				}
			});
		});
	}
	if (!gcm) {
		log.debug('No gcm found for user retrying saving token...');
		const data = getTokenAndSession();
		if (data.error) log.info(data.error);
		updateUser({ data }, (error) => {
			if (!error) {
				register();
				return;
			} else {
				log.info('No gcm found for user');
			}
		});
	}
	register();
}
function handleSubscription(changes) {
	const counter = new Counter();

	if (!changes.entities) {
		// next();
		return;
	}
	for (const i in changes.entities) {
		const entity = changes.entities[i];

		if (
				entity.type === Constants.TYPE_THREADREL ||
				entity.type === Constants.TYPE_ROOMREL
			) {
				// console.log("subscribe to thread/room")
				// TODO: subscribe to topics only when relation is created
				// console.log("entity: ", entity)
			let user = changes.entities[entity.user];

			if (!user) {
				counter.inc();
				cache.getEntity(entity.user, (e, u) => {
					user = u;
					counter.dec();
				});
			}
			counter.then(() => {
				log.info('subscribe ' + user.id + ' to ' + entity.item);
				subscribe({
					params: user.params || {},
					topic: entity.type === Constants.TYPE_ROOMREL ? 'room-' + entity.item : 'thread-' + entity.item
				});
				// next();
				return;
			});
		} else {
			// next();
			return;
		}
	}
}
bus.on('change', handleSubscription);