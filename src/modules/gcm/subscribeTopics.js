/* @flow */
import { config, bus, Constants, cache } from '../../core-server';
import Counter from '../../lib/counter';
import log from 'winston';
import values from 'lodash/values';
import request from 'request';
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

function subscribe (userRel: Object) {
	const gcm = userRel.params.gcm;

	if (!gcm) {
		log.info('No gcm found for user');
		return;
	}
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
				});
			}
		});
	});

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
					user,
					topic: entity.type === Constants.TYPE_ROOMREL ? 'room-' + entity.item : 'thread-' + entity.item
				});
				// next();
			});
		}
		if (entity.type === Constants.TYPE_USER) {
			// console.log("entity: ", entity)
			if (entity.createTime) {
				// subscribe for mention when user is created
				log.info('subscribing user: ', entity.id, 'for mention');
				subscribe({
					params: entity.params,
					topic: 'mention-' + entity.id
				});
				// next();
			}
		}
	}
}
bus.on('change', handleSubscription);
