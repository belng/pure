/* @flow */

import { Constants, bus, cache } from '../../core-server';
import Counter from '../../lib/counter';
import Relation from '../../models/rel';

bus.on('setstate', (changes, next) => {
	if (!changes.entities) return next();
	let counter = new Counter();
	for (let id in changes.entities) {
		let entity = changes.entities[id],
			text, threadRel, role, user;

		if ( entity.type === Constants.TYPE_TEXTREL && entity.roles.indexOf(Constants.ROLE_MENTIONED) > -1 ) {
			text = changes.entities[entity.item];
			role = [ Constants.ROLE_MENTIONED ];
			user = entity.user;
			if (!text) {
				counter.inc();
				cache.getEntity(entity.item, (err, item) => {
					text = item;
					counter.dec();
				});
			}
		}

		if (entity.type === Constants.TYPE_TEXT) {
			text = entity;
			role = [ Constants.ROLE_FOLLOWER ];
			user = entity.creator;
		}

		counter.then(() => {
			threadRel = {
				item: text.parents[0][0],
				user: user,
				type: Constants.TYPE_THREADREL,
				roles: role
			};
			let relation = new Relation(threadRel);
			changes.entities[relation.getId()] = relation;
		});
	}
	next();
//	counter.then(next)
});
