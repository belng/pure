import pg from '../../lib/pg';
import { EventEmitter } from 'events';
import { ITEM_TYPES, RELATION_TYPES, ROLES,  } from './../../lib/schema';
import * as Constants from './../../lib/Constants';

export default function(changes) {
	const stream = new EventEmitter();

	for (const key in changes.entities) {
		const entity = changes.entities[key];

		if (ITEM_TYPES.indexOf(changes.entities[key].type) >= 0) {
			pg.readStream(pg.cat({
				$: 'SELECT resources FROM rels WHERE item = &{id} or item = &{parent} and NOT(roles <@ &{excludeRoles}) and presence > &{presence}',
				id: key,
				parent: entity.parent && entity.parent[0],
				excludeRoles: [ ROLES.ROLE_BANNED ],
				presence: Constants.STATUS_NONE
			})).on('data', (res) => {
				stream.emit('data', {
					entities: {
						[key]: entity
					}
				}, res);
			});
		} else if (RELATION_TYPES.indexOf(entity.type) >= 0) {
			pg.readStream(pg.cat({
				$: 'SELECT resources FROM users WHERE id = &{r.user} UNION ' +
				'SELECT resources FROM rels WHERE item = &{item}' +
				'AND NOT(role <@ excludeRoles) AND presence > &{presence}',
				user: entity.user,
				item: entity.item,
				excludeRoles: [ ROLES.ROLE_BANNED ],
				presence: Constants.STATUS_NONE
			})).on('data', (res) => {
				stream.emit('data', {
					entities: {
						[key]: entity
					}
				}, res);
			});
		} else if (entity.type === Constants.TYPE_USER || entity.type === Constants.TYPE_NOTE) {
			pg.readStream(pg.cat({
				$: 'SELECT resources FROM users WHERE id = &{user}',
				user: entity.user
			})).on('data', (res) => {
				stream.emit('data', {
					entities: {
						[key]: entity
					}
				}, res);
			});
		}
	}

	return stream;
}
