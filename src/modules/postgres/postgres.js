import jsonop from 'jsonop';
import EnhancedError from '../../lib/EnhancedError';
import sbcache from 'sbcache';
import winston from 'winston';
import Counter from '../../lib/counter';
import * as pg from '../../lib/pg';
import * as Constants from '../../lib/Constants';
import { TABLES, TYPES, TYPE_NAMES } from '../../lib/schema';
import queryHandler from './query';
import entityHandler from './entity';
import { bus, cache, config } from '../../core-server';
import * as Types from './../../models/models';
const channel = 'heyneighbor';

const TYPE_SEGMENT = `case \
when tableoid = 'notes'::regclass then ${Constants.TYPE_NOTE} \
when tableoid = 'privs'::regclass then ${Constants.TYPE_PRIV} \
when tableoid = 'roomrels'::regclass then ${Constants.TYPE_ROOMREL} \
when tableoid = 'rooms'::regclass then ${Constants.TYPE_ROOM} \
when tableoid = 'textrels'::regclass then ${Constants.TYPE_TEXTREL} \
when tableoid = 'texts'::regclass then ${Constants.TYPE_TEXT} \
when tableoid = 'threadrels'::regclass then ${Constants.TYPE_THREADREL} \
when tableoid = 'threads'::regclass then ${Constants.TYPE_THREAD} \
when tableoid = 'topicrels'::regclass then ${Constants.TYPE_TOPICREL} \
when tableoid = 'topics'::regclass then ${Constants.TYPE_TOPIC} \
when tableoid = 'users'::regclass then ${Constants.TYPE_USER} \
end as type`;

function broadcast (entity) {
	pg.notify(config.connStr, channel, entity);
}

cache.onChange((changes) => {
	const cb = (key, range, err, r) => {
		let newRange = [], start, end;

		if (err) {
			winston.error(err);
			return;
		}

		const results = r.map(e => {
			const props = Object.keys(e), propsCount = props.length;
			let prop;

			props.forEach(name => {
				e[name] = new Types[name](e[name]);
				prop = name;
			});

			if (propsCount > 1) return e;
			else return e[prop];
		});

		const orderedResult = new sbcache.OrderedArray([ cache.keyToSlice(key).order ], results);

		if (range.length === 2) {
			newRange = range;
		} else {
			start = range[0];
			if (range[1] > 0 && range[2] > 0) {
				const index = orderedResult.indexOf(start);

				start = orderedResult.valAt(0);
				end = orderedResult.valAt(orderedResult.length - 1);

				if (index < range[1]) {
					start = -Infinity;
				}

				if (orderedResult.length - index < range[2]) {
					end = +Infinity;
				}
			} else if (range[1] > 0) {
				end = orderedResult.valAt(orderedResult.length - 1);
				if (orderedResult.length < range[1]) start = -Infinity;
			} else if (range[2] > 0) {
				end = orderedResult.length < range[2] ? +Infinity : orderedResult.valAt(orderedResult.length - 1);
			}
			newRange.push(start, end);
		}
		cache.put({
			knowledge: { [key]: [ newRange ] },
			indexes: { [key]: orderedResult }
		});
	};

	if (changes.queries) {
		for (const key in changes.queries) {
			if (key === 'entities') {
				const ids = Object.keys(changes.queries.entities),
					typeToEntities = {
						item: [],
						user: []
					};

				ids.forEach((id) => {
					const _split = id.split('_');
					let type;

					if (_split.length === 3) return;
					else if (_split.length === 2) return;
					else if (id.length >= 36) type = 'item';
					else type = 'user';
					typeToEntities[type].push(id);
				});

				// TODO: move to diff file.
				for (const i in typeToEntities) {
					if (!typeToEntities[i].length) continue;

					pg.read(config.connStr, {
						$: `select *, ${TYPE_SEGMENT} from "${TABLES[TYPES[i]]}" where id in (&(ids))`,
						ids: typeToEntities[i]
					}, (err, r) => {
						if (err) {
							winston.error(err.message);
							return;
						}

						const state = {
							entities: {},
							source: 'postgres'
						};

						r.map((entity) => {
							state.entities[entity.id] = new Types[TYPE_NAMES[entity.type]](entity);
						});

						const missingIds = ids.filter(itemID => !state.entities[itemID]);

						missingIds.forEach(id => {
							state.entities[id] = null;
						});

						cache.put(state);
					});
				}
			} else {
				for (const range of changes.queries[key]) {
					pg.read(
						config.connStr,
						queryHandler(cache.keyToSlice(key), range),
						cb.bind(null, key, range)
					);
				}
			}
		}
	}
});

pg.listen(config.connStr, channel, (payload) => {
	const change = { entities: { [payload.id]: payload } };

	bus.emit('postchange', change);
	cache.put(change);
});

bus.on('change', (changes, next) => {
	const counter = new Counter(), response = changes.response = changes.response || {}, ids = [];

	if (!response.entities) response.entities = {};
	if (changes.source === 'postgres') {
		next();
		return;
	}

	if (changes.entities) {
		const sql = [];

		for (const id in changes.entities) {
			ids.push(id);
			sql.push(entityHandler(changes.entities[id]));
		}

		winston.info('sql', sql);
		counter.inc();
		pg.write(config.connStr, sql, (err, results) => {
			let i = 0;

			if (err) {
				counter.err(err);
				return;
			}

			results.forEach(result => {
				winston.info(`Response for entity: ${ids[i]}`, JSON.stringify(result.rowCount));

				if (result.rowCount) {
					// response.entities[result.rows[0].id] = result.rows[0];
					broadcast(result.rows[0]);
				} else {
					const c = response.entities[ids[i]] = changes.entities[ids[i]];

					c.error = new EnhancedError('INVALID_ENTITY', 'INVALID_ENTITY');
				}
				i++;
			});
			counter.dec();
		});
	}


	if (changes.queries) {
		winston.debug('Got queries: ', JSON.stringify(changes));
		const cb = (key, err, results) => {
				if (err) { jsonop(response, { state: { error: err } }); }
				jsonop(response, { indexes: { [key]: results } });
				counter.dec();
			},
			entityCallback = (err, result) => {
				if (err) { jsonop(response, { state: { error: err } }); }
				if (result && result.id) {
					response.entities = response.entities ? response.entities : {};
					response.entities[result.id] = result;
				}

				counter.dec();
			};

		for (const key in changes.queries) {
			if (key === 'entities') {
				for (const entity in changes.queries[key]) {
					counter.inc();
					cache.getEntity(entity, entityCallback);
				}
			} else {
				for (const range of changes.queries[key]) {
					counter.inc();
					cache.query(key, range, cb.bind(null, key));
				}
			}
		}
	}

	counter.then(next);
});
