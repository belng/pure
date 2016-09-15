/* @flow */
/* eslint dot-notation: 0*/
/* eslint array-callback-return: 0 */
/* eslint consistent-return: 0*/
import { config, bus, cache } from '../../core-server';
import * as Constants from '../../lib/Constants';
import promisify from '../../lib/promisify';
import Logger from '../../lib/logger';
import values from 'lodash/values';
import request from 'request';
import { getTokenFromSession, updateUser } from './handleUpstreamMessage';

const queryAsync = promisify(cache.query.bind(cache));
const getEntityAsync = promisify(cache.getEntity.bind(cache));
const authKey = 'key=' + config.gcm.apiKey, log = new Logger(__filename);
const options = {
	url: 'https://iid.googleapis.com/iid/v1:batchAdd',
	json: true,
	method: 'POST',
	headers: {
		Authorization: authKey,
	},
	body: {},
};

export function getIIDInfo(iid: string, cb?: Function) {
	if (!cb) {
		request({
			url: `https://iid.googleapis.com/iid/info/${iid}?details=true`,
			method: 'GET',
			headers: {
				Authorization: authKey,
			},
		}, (e, r, b) => {
			if (e || !b) {
				log.error(e);
				return null;
			}
			try {
				return JSON.parse(b).rel.topics;
			} catch (error) {
				return null;
			}
		});
	} else {
		request({
			url: `https://iid.googleapis.com/iid/info/${iid}?details=true`,
			method: 'GET',
			headers: {
				Authorization: authKey,
			},
		}, cb);
	}
}

function unsubscribeTopics (data, cb) {
	log.info('unsubscribe data: ', data);
	let iids = [];

	if (Array.isArray(data.iid)) {
		iids = data.iid;
	} else {
		iids.push(data.iid);
	}

	if (data.topic) {
		request({
			...options,
			url: 'https://iid.googleapis.com/iid/v1:batchRemove',
			body: {
				registration_tokens: iids,
				to: '/topics/' + data.topic,
			},
		}, (err, rspns, bdy) => {
			if (!err) {
				log.info('unsubscribed from ', data.topic || '');
				log.info(bdy);
			} else {
				log.error(err);
			}
		});
	} else {
		iids.forEach(iid => {
			const topics = getIIDInfo(iid);
			if (!topics) return;
			topics.map(topic => {
				if (!/thread-/.test(topic)) {
					log.debug('does not match thread');
					return null;
				}

				request({
					...options,
					url: 'https://iid.googleapis.com/iid/v1:batchRemove',
					body: {
						registration_tokens: [ iid ],
						to: '/topics/' + topic,
					},
				}, err => {
					if (!err) {
						log.info('unsubscribed from ', topic);
					} else {
						log.error('Error unsubscribing: ', err);
					}
				});
			});
			if (cb) {
				cb();
			}
		});
	}
}

export function subscribe (userRel: Object) {
	const gcm = userRel.params ? userRel.params.gcm : null;
	const tokens = values(gcm);
	function register () {
		log.info('tokens: ', tokens);
		request({
			...options,
			body: {
				registration_tokens: tokens,
				to: '/topics/' + userRel.topic,
			},
		}, (error, response, body) => {
			if (error) {
				log.error('error subscribing to topic: ', userRel.topic, tokens, error);
				if (error.type === 'TOO_MANY_TOPICS') {
					log.info('unsubscribe few old topics');
					unsubscribeTopics({ iid: tokens }, () => {
						subscribe(userRel);
					});
				} else {
					log.error(userRel.params.id + 'can not subscribe to topic', error, response, body);

				}
			}
			if (body && body.error) {
				log.error(body, userRel.topic, response);
				// console.log(options);
			} else {
				log.info(userRel.params + ' is subscribed to ' + userRel.topic);
			}
		}).on('error', (err) => {
			log.error('on error here:', err);
			register();
		});
	}
	if (!gcm) {
		log.debug('No gcm found for user retrying from saved token...');
		const data = getTokenFromSession(null);
		if (data.error) log.info(data.error);
		updateUser({ data }, (error) => {
			// console.log("dta: ", data);
			if (!error) {
				register();
				return;
			} else {
				log.info('No gcm found for user');
			}
		});
	} else {
		register();
	}
}

async function mapRelsAndSubscriptions(entity) {
	const user = await getEntityAsync(entity.user);
	log.info('user gcm: ', user);
	if (!user || !user.params || !user.params.gcm) return;
	const tokens = values(user.params.gcm);
	log.info('token: ', tokens);
	const rels = await queryAsync(
		{
			type: 'roomrel',
			filter: {
				user: user.id,
				roles_cts: [ Constants.ROLE_FOLLOWER ]
			},
			order: 'createTime',
		}, [ -Infinity, Infinity ]
	);

	// console.log('rels gcm: ', rels);
	tokens.forEach((token) => {
		getIIDInfo(token, (e, r, b) => {
			if (e) return;
			try {
				const parsedBody = JSON.parse(b);

				if (e || !b || !parsedBody.rel) {
					log.error(e, parsedBody);
					return;
				}
				const subscribedRooms = Object.keys(parsedBody.rel.topics).filter(topic => {
					return /room-/.test(topic);
				}).map(room => {
					return room.replace('room-', '');
				});
				const roomsFollowing = rels.arr.map((room) => {
					return room.item;
				});
				log.info('all here: ', subscribedRooms, roomsFollowing);

				const roomsNotSubscribed = roomsFollowing.filter(room => {
					return subscribedRooms.indexOf(room) === -1;
				});
				const notFollowingSubscribed = subscribedRooms.filter(room => {
					return roomsFollowing.indexOf(room) === -1;
				});
				log.info('rooms following but not subscribed: ', roomsNotSubscribed);
				log.info('rooms not following but subscribed: ', notFollowingSubscribed);

				if (roomsNotSubscribed.length > 0) {
					roomsNotSubscribed.forEach(room => {
						subscribe({
							params: user.params,
							topic: 'room-' + room,
						});
					});
				}

				if (notFollowingSubscribed.length > 0) {
					notFollowingSubscribed.forEach(room => {
						unsubscribeTopics({ iid: token, topic: 'room-' + room });
					});
				}
			} catch (er) {
				log.error('Error parsing body: ', er);
				// console.log(b, e, r);
			}
		});
	});
}

async function handleSubscription(changes, next) {
// Map users relations and subscriptions only when user opens the app. not every time
	if (changes.auth && changes.auth.session) {
		mapRelsAndSubscriptions({ user: changes.auth.user });
	}
	if (!changes.entities || !config.gcm.apiKey) {
		next();
		return;
	}

	const promises = Object.keys(changes.entities).map(async id => {
		const entity = changes.entities[id];
		if (entity && !entity.roles) return;
		const user = await getEntityAsync(entity.user);
		const gcm = user.params && user.params.gcm;
		const	tokens = values(gcm);
		const topic = entity.type === Constants.TYPE_ROOMREL ? 'room-' +
		 entity.item : 'thread-' + entity.item;

		if (entity.roles.length > 0) {
			const prevRel = await getEntityAsync(id);
			if (
				!prevRel ||
				(prevRel.roles && prevRel.roles.length === 0)
			) {
				log.info('subscribe ' + user.id + ' to ' + entity.item);
				subscribe({
					params: user.params || {},
					topic,
				});
			}
		}

		if (entity.roles && entity.roles.length === 0) {
			log.info('Got unfollow, unsubscribe from topics');
			tokens.forEach((token) => {
				unsubscribeTopics({ iid: token, topic }, () => {
					log.info('Unsubscribed from topic: ', topic);
				});
			});
			return;
		}
	});
	await Promise.all(promises);
	next();
}

// console.log("Constants.APP_PRIORITIES.GCM", Constants.APP_PRIORITIES.GCM);
bus.on('change', handleSubscription, Constants.APP_PRIORITIES.GCM);
