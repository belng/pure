/* @flow */

import { TABLES, ROLES } from '../../lib/schema';
import { bus, cache } from '../../core-server';
import * as Constants from '../../lib/Constants';
import promisify from '../../lib/promisify';
import log from 'winston';
import { user as User } from '../../models/models';
import jsonop from 'jsonop';

const getEntityAsync = promisify(cache.getEntity.bind(cache));

bus.on('change', (changes, next) => {
	if (!changes.entities) {
		next();
		return;
	}
	const promises = [];
	for (const id in changes.entities) {
		const entity = changes.entities[id];

		// 1. Increment children counts on parents
		if (
			entity.type === Constants.TYPE_TEXT ||
			entity.type === Constants.TYPE_THREAD
		) {
			if (!entity.createTime || entity.createTime !== entity.updateTime || (!entity.parents || !entity.parents.length)) {
				continue;
			}
			let inc;
			log.info('Count module reached: ', entity);
			if (entity.createTime === entity.updateTime) {
				log.info('increase count');
				inc = 1;
			} else if (entity.deleteTime) {
				inc = -1;
			}

			const parent = changes.entities[entity.parents[0]] || {};
			parent.counts = parent.counts || {};
			parent.counts.children = [ inc, '$add' ];

			parent.id = entity.parents[0];
			parent.type = (entity.type === Constants.TYPE_TEXT) ?
				Constants.TYPE_THREAD : Constants.TYPE_ROOM;

			changes.entities[entity.parents[0]] = jsonop.merge(changes.entities[entity.parents[0]], parent);

			// 2. Increment text/thread count of user

			const user = new User({ id: entity.creator });

			user.counts = {};
			user.counts[TABLES[entity.type]] = [ inc, '$add' ];
			user.id = entity.creator;
			changes.entities[entity.creator] = jsonop.merge(changes.entities[entity.creator], user);
		}

		 // 3. Increment related counts on items

		if (
			entity.type === Constants.TYPE_TEXTREL ||
			entity.type === Constants.TYPE_THREADREL ||
			entity.type === Constants.TYPE_ROOMREL ||
			entity.type === Constants.TYPE_PRIVREL ||
			entity.type === Constants.TYPE_TOPICREL
		) {
			if (!entity.id) entity.id = entity.user + '_' + entity.item;
			promises.push(getEntityAsync(entity.id).then(result => {
				let rolesToInc = [], upvote, user, presenceChanged;
				const rolesToDec = [], newArr = [];

				// console.log("result: ", result);
				// console.log('entty: ', entity)
				if (result) {
					entity.roles.forEach((role) => {
						if (result.roles.indexOf(role) === -1) {
							rolesToInc.push(role);
						}
					});

					result.roles.forEach(role => {
						if (entity.roles.indexOf(role) === -1) {
							rolesToDec.push(role);
						}
					});
					if (entity.hasOwnProperty('presence') && result.presence !== entity.presence) {
						presenceChanged = true;
					}
					if (rolesToInc.length === 0 && rolesToDec.length === 0 && !presenceChanged) {
						return null;
					}
				} else {
					rolesToInc = entity.roles;
					if (entity.hasOwnProperty('presence')) {
						presenceChanged = true;
					}
				}

				const item = changes.entities[entity.item] || {};
				item.id = entity.item;

				switch (entity.type) {
				case Constants.TYPE_TEXTREL:
					item.type = Constants.TYPE_TEXT;
					break;
				case Constants.TYPE_THREADREL:
					item.type = Constants.TYPE_THREAD;
					break;
				case Constants.TYPE_ROOMREL:
					item.type = Constants.TYPE_ROOM;
					break;
				case Constants.TYPE_PRIVREL:
					item.type = Constants.TYPE_PRIV;
					break;
				case Constants.TYPE_TOPICREL:
					item.type = Constants.TYPE_TOPIC;
					break;
				}
				item.counts = item.counts || {};

				if (rolesToInc.length > 0) {
					rolesToInc.forEach((role) => {
						if (role === Constants.ROLE_UPVOTE) {
							upvote = 1;
						}
						if (ROLES[role]) {
							item.counts[ROLES[role]] = [ 1, '$add' ];
						}
					});
				}

				if (rolesToDec.length > 0) {
					rolesToDec.forEach((role) => {
						if (role === Constants.ROLE_UPVOTE) {
							upvote = -1;
						}
						if (ROLES[role]) {
							item.counts[ROLES[role]] = [ -1, '$add' ];
						}
					});
				}
				if (presenceChanged) {
					if (entity.presence === Constants.STATUS_FG) {
						item.counts.online = [ 1, '$add' ];
					} else {
						item.counts.online = [ -1, '$add' ];
					}
				}
				// console.log("count module: ", item)
				changes.entities[entity.item] = item;
				if (upvote) {
					newArr.push(getEntityAsync(entity.item).then(rsult => {
						user = new User({ id: rsult.creator });
						user.counts = {
							upvotes: {}
						};
						user.counts.upvotes[TABLES[item.type]] = [ upvote, '$add' ];
						changes.entities[rsult.creator] = user;
					}));
				}
				return Promise.all(newArr);
			}));
		}
	}

	Promise.all(promises).then(
		() => next(),
		err => next(err),
	);
}, Constants.APP_PRIORITIES.COUNT);
log.info('Count module ready.');
