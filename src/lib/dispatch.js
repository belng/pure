import * as pg from './pg';
import { EventEmitter } from 'events';
import * as Constants from './Constants';
import winston from 'winston';
// import util from 'util';

export default function(changes, config) {
	const stream = new EventEmitter();

	for (const key in changes.entities) {
		const e = changes.entities[key];

		const query = ((entity) => {
			switch (entity.type) {
			case Constants.TYPE_NOTE:
			case Constants.TYPE_USER:
				console.trace('UPDATING: TYPE_NOTE or TYPE_USER', e);
				return pg.cat([ {
					$: 'SELECT resources FROM users WHERE id = &{user}',
					user: entity.id || entity.user
				} ]);
			case Constants.TYPE_ROOM:
			case Constants.TYPE_TEXT:
			case Constants.TYPE_THREAD:
			case Constants.TYPE_TOPIC:
			case Constants.TYPE_PRIV:
				winston.debug('DISPATCHING ITEMS');
				return pg.cat([ {
					id: key,
					$: 'SELECT resources FROM rels WHERE item = &{id} or item = &{parent} and NOT(roles && &{excludeRoles}) and presence > &{presence}',
					parent: entity.parents && entity.parents[0],
					excludeRoles: [ Constants.ROLE_BANNED ],
					presence: Constants.STATUS_NONE
				} ]);
			case Constants.TYPE_ROOMREL:
			case Constants.TYPE_TEXTREL:
			case Constants.TYPE_THREADREL:
			case Constants.TYPE_TOPICREL:
			case Constants.TYPE_PRIVREL:
				winston.debug('DISPATCHING RELS');
				return pg.cat([ {
					$: 'SELECT resources FROM users WHERE id = &{user} UNION ' +
					'SELECT resources FROM rels WHERE item = &{item}' +
					'AND NOT(roles <@ &{excludeRoles}) AND presence > &{presence}',
					user: entity.user,
					item: entity.item,
					excludeRoles: [ Constants.ROLE_BANNED ],
					presence: Constants.STATUS_NONE
				} ]);
			}

			return null;
		})(e);

		if (query) {
			pg.readStream(config.connStr, query).on('row', (res) => {
				stream.emit('data', {
					entities: {
						[key]: e
					}
				}, res);
			});
		}
	}

	return stream;
}
