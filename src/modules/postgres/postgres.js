import { bus, cache, config } from '../../core-server';
import Counter from '../../lib/counter';
import EnhancedError from '../../lib/EnhancedError';
import * as PgEntity from './entity/entity';
import jsonop from 'jsonop';
import Know from '../../submodules/know/lib/Cache';
import * as pg from '../../lib/pg';
import presenceHandler from './presence';
import queryHandler from './query';
import { TYPE_NAMES } from '../../lib/schema';
import * as Types from './../../models/models';
import winston from 'winston';

const channel = 'heyneighbor';

function getTypeFromId(id) {
	const _split = id.split();

	console.log("_split", _split);
	if (_split.length === 3) return 'rest';
	else if (_split.length === 2) return 'rel';
	else if (id.length >= 36) return 'item';
	else return 'user';
}

function broadcast (entity) {
	pg.notify(config.connStr, channel, entity);
}

// TODO: use the function in Cache and delete this.
function rangeToKnowledge(range, orderedResult) {
	let newRange = new Know.RangeArray([]), start, end;

	if (range.length === 2) {
		newRange = new Know.RangeArray([ range ]);
	} else {
		start = range[0];
		if (range[1] > 0 && range[2] > 0) {
			const index = orderedResult.indexOf(start);

			start = index < range[1] ? -Infinity : orderedResult.valAt(0);
			end = orderedResult.length - index < range[2] ? +Infinity :
				orderedResult.valAt(orderedResult.length - 1);
		} else if (range[1] > 0) {
			start = orderedResult.length < range[1] ? -Infinity : orderedResult.valAt(0);
			end = range[0];
		} else if (range[2] > 0) {
			start = range[0];
			end = orderedResult.length < range[2] ? +Infinity : orderedResult.valAt(orderedResult.length - 1);
		}
		newRange.add([ start, end ]);
	}

	return newRange;
}


function onRangeQuery(key, range, err, r) {
	if (err) {
		winston.error(err);
		return;
	}

	const results = r.map(e => {
		const props = Object.keys(e), propsCount = props.length;
		let prop;

		props.forEach(name => {
			if (e[name]) {
				e[name] = new Types[name](e[name]);
				prop = name;
			}
		});

		if (propsCount > 1) return e;
		else return e[prop];
	});

	const orderedResult = new Know.OrderedArray(cache.arrayOrder(cache.keyToSlice(key)), results);

	const newRange = rangeToKnowledge(range, orderedResult);

	cache.put({
		knowledge: { [key]: newRange },
		indexes: { [key]: orderedResult }
	});
}

function onEntityQuery(ids, err, r) {
	if (err) {
		winston.error(err.message);
		return;
	}

	const entities = {};

	r.forEach((row) => {
		entities[row.id] = new Types[TYPE_NAMES[row.type]](row);
	});

	const missingIds = ids.filter(id => !!entities[id]);

	missingIds.forEach(id => { entities[id] = false; });
	cache.put({
		entities,
		source: 'postgres'
	});
}

cache.onChange((changes) => {
	if (changes.queries) {
		for (const key in changes.queries) {
			if (key === 'entities') {
				const ids = Object.keys(changes.queries.entities),
					typeToId = ids.reduce((map, id) => {
						map[getTypeFromId(id)].push(id);
						return map;
					}, {
						item: [],
						user: [],
						note: [],
						rel: [],
						rest: []
					});

				typeToId.rest.forEach(id => {
					cache.put({ entities: { [id]: false } });
				});

				for (const i in typeToId) {
					// FIXME: Notes only for now
					if (i === 'rest' || i === 'note' || !typeToId[i].length) continue;
					console.log("Type:", i);
					pg.read(config.connStr,
						PgEntity.read[i](typeToId[i]),
						onEntityQuery.bind(null, typeToId[i])
					);
				}
			} else {
				for (const range of changes.queries[key]) {
					pg.read(
						config.connStr,
						queryHandler(cache.keyToSlice(key), range),
						onRangeQuery.bind(null, key, range)
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
			sql.push(PgEntity.write(changes.entities[id]));
			if ('presence' in changes.entities[id] && !('create' in changes.entities[id])) {
				ids.push(id);
				sql.push(presenceHandler(changes.entities[id]));
			}
		}

		winston.info('sql', sql);
		counter.inc();
		// console.log("Inspecting the object to be inserted:", util.inspect(changes.entities, { depth: null }));
		pg.write(config.connStr, sql, (err, results) => {
			let i = 0;

			// console.log("Inspecting the results that was inserted:", util.inspect(results, { depth: null }));
			if (err) {
				counter.err(err);
				return;
			}

			results.forEach(result => {
				winston.info(`Response for entity: ${ids[i]}`, JSON.stringify(result.rowCount));

				if (result.rowCount) {
					if (changes.entities[result.rows[0].id]) delete changes.entities[result.rows[0].id].create;
					broadcast(changes.entities[result.rows[0].id]);
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
		const cb = (key, range, err, results) => {
				if (err) { jsonop(response, { state: { error: err } }); }
				counter.dec();

				const orderedResult = new Know.OrderedArray([ cache.keyToSlice(key).order ], results);
				const newRange = rangeToKnowledge(range, orderedResult);

				jsonop(response, {
					indexes: { [key]: results },
					knowledge: { [key]: newRange }
				});
				counter.dec();
			},

			entityCallback = (id, err, result) => {
				if (err) { jsonop(response, { state: { error: err } }); }
				if (result && result.id) {
					response.entities = response.entities ? response.entities : {};
					response.entities[result.id] = result;
				} else if (result === false) {
					response.entities[id] = false;
				}

				counter.dec();
			};

		for (const key in changes.queries) {
			if (key === 'entities') {
				for (const entity in changes.queries[key]) {
					counter.inc();
					cache.getEntity(entity, entityCallback.bind(null, entity));
				}
			} else {
				for (const range of changes.queries[key]) {
					counter.inc();
					cache.query(key, range, cb.bind(null, key, range));
				}
			}
		}
	}

	counter.then(next);
});
