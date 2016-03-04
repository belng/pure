/* @flow */

import { Constants, bus, cache } from '../../core-server';
import Counter from '../../lib/counter';
import Relation from '../../models/rel';

bus.on('change', (changes, next) => {
	if (!changes.entities) return next();
	const counter = new Counter();

	for (const id in changes.entities) {
		const entity = changes.entities[id];
		let text, role, user;

		if (entity.type === Constants.TYPE_TEXTREL && entity.roles.indexOf(Constants.ROLE_MENTIONED) > -1) {
			text = changes.entities[entity.item];
			role = [ Constants.ROLE_MENTIONED ];
			user = entity.user;
			if (!text) {
				counter.inc();
				cache.getEntity(entity.item, (err, item) => {
					if (err) return next(err);
					text = item;
					counter.dec();
					return null;
				});
			}
		}

		if (entity.type === Constants.TYPE_TEXT) {
			text = entity;
			role = [ Constants.ROLE_FOLLOWER ];
			user = entity.creator;
		}

		counter.then(() => {
			const threadRel = {
				item: text.parents[0],
				user,
				create: true,
				type: Constants.TYPE_THREADREL,
				roles: role
			};
			const relation = new Relation(threadRel);

			changes.entities[relation.id] = relation;
			console.log('All Relations created:', JSON.stringify(changes));
			next();
		});
	}

	return null;
});
