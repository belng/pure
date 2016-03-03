import jsonop from 'jsonop';
import sbcache from 'sbcache';
import winston from 'winston';
import Counter from '../../lib/counter';
import * as pg from '../../lib/pg';
import { TABLES, TYPES } from '../../lib/schema';
import queryHandler from './query';
import entityHandler from './entity';
import { bus, cache, config } from '../../core-server';
import * as Types from './../../models/models';
import './cache-updater';
const channel = 'heyneighbor';


const TYPE_SEGMENT = `case \
when tableoid = 'notes'::regclass then 'note' \
when tableoid = 'privs'::regclass then 'privs' \
when tableoid = 'roomrels'::regclass then 'roomrels' \
when tableoid = 'rooms'::regclass then 'room' \
when tableoid = 'textrels'::regclass then 'textrel' \
when tableoid = 'texts'::regclass then 'text' \
when tableoid = 'threadrels'::regclass then 'threadrel' \
when tableoid = 'threads'::regclass then 'thread' \
when tableoid = 'topicrels'::regclass then 'topicrel' \
when tableoid = 'topics'::regclass then 'topic' \
when tableoid = 'users'::regclass then 'user' \
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
				newRange.push(start, end);
			} else if (range[1] > 0) {
				end = orderedResult.length < range[1] ? -Infinity : orderedResult.valAt(orderedResult.length);
				newRange.push(end, start);
			} else if (range[2] > 0) {
				end = orderedResult.length < range[2] ? +Infinity : orderedResult.valAt(orderedResult.length);
				newRange.push(start, end);
			}
		}

		console.log("NEW: ", newRange);
		bus.emit('change', {
			knowledge: { [key]: [ newRange ] },
			indexes: { [key]: orderedResult },
			source: 'postgres'
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
							state.entities[entity.id] = new Types[entity.type](entity);
						});

						const missingIds = ids.filter(itemID => !state.entities[itemID]);

						missingIds.forEach(id => {
							state.entities[id] = null;
						});

						bus.emit('change', state);
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
	bus.emit('postchange', payload);
});

bus.on('change', (changes, next) => {
	const counter = new Counter(), response = changes.response = changes.response || {};

	if (!response.entities) response.entities = {};
	if (changes.source === 'postgres') {
		next();
		return;
	}

	if (changes.entities) {
		const sql = [];

		for (const id in changes.entities) {
			sql.push(entityHandler(changes.entities[id]));
		}

		winston.info('sql', sql);
		counter.inc();
		pg.write(config.connStr, sql, (err, results) => {
			if (err) {
				counter.err(err);
				return;
			}

			winston.info('PgWrite Results', results[0].rows);
			results.forEach((result) => {
				response.entities[result.rows[0].id] = result.rows[0];
				broadcast(result.rows[0]);
			});

			counter.dec();
		});
	}


	if (changes.queries) {
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

	counter.then(() => {
		console.log('next fired in postgres');
		next();
	});
});
