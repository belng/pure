/* @flow */

'use strict';

import { TABLES, COLUMNS, TYPES, ROLES } from '../../lib/schema';
import { Constants, bus, cache } from '../../core';

bus.on('setstate', (changes, next) => {
	if (!changes.entities) return next();

	for (let id in changes.entities) {
		let entity = changes.entities[id];

		// 1. Increment children counts on parents
		if (
			entity.type === Constants.TYPE_TEXT ||
			entity.type === Constants.TYPE_THREAD
		) {
			let inc;

			if (entity.createtime) {
				inc = 1;
			} else if (entity.deletetime) {
				inc = -1;
			} else {
				continue;
			}

			let parent = changes.entities[entity.parents[0][0]] || {};

			parent.counts = parent.counts || {};
			parent.counts.children = inc;
			parent.id = entity.parents[0][0];
			parent.type = ( entity.type === Constants.TYPE_TEXT ) ?
				Constants.TYPE_THREAD : Constants.TYPE_ROOM;
			changes.entities[entity.parents[0][0]] = parent;

			// 2. Increment text/thread count of user

			let user = changes.entities[entity.creator] || {};
			user.counts = user.counts || {};
			user.counts[TABLES[entity.type]] = inc;
			user.id = entity.creator;
			changes.entities[entity.creator] = user;
		}

		 // 3. Increment related counts on items

		if (
			entity.type === Constants.TYPE_TEXTREL ||
			entity.type === Constants.TYPE_THREADREL ||
			entity.type === Constants.TYPE_ROOMREL ||
			entity.type === Constants.TYPE_PRIVREL ||
			entity.type === Constants.TYPE_TOPICREL
		) {
			let item = changes.entities[entity.item] || {};

			item.counts = item.counts || {};

			if (entity.__op__ && entity.__op__.role && entity.__op__.roles[0] === 'union') {
				let rem = entity.__op__.roles[0].slice(1);
				rem.forEach((role) => {
					if (ROLES[role]) {
						item.counts[ROLES[role]] = -1;
					}
				});
			}

			entity.roles.forEach((role) => {
				if (ROLES[role]) {
					item.counts[ROLES[role]] = 1;
				}
			});

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
			changes.entities[entity.item] = item;
		}
	}
	next();
}, 'modifier');
