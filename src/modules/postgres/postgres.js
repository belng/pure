import jsonop from 'jsonop';
import winston from 'winston';
import Counter from '../../lib/counter';
import * as pg from '../../lib/pg';
import queryHandler from './query';
import entityHandler from './entity';
import { bus, cache, config } from '../../core-server';
import * as Types from './../../models/models';
import './cache-updater';
const channel = 'heyneighbor';


const TYPE_SEGMENT = `case \
when tableoid = 'notes'::regclass then 'note' \
when tableoid = 'privrels'::regclass then 'privrel' \
when tableoid = 'privs'::regclass then 'privs' \
when tableoid = 'roomrels'::regclass then 'roomrels' \
when tableoid = 'rooms'::regclass then 'room' \
when tableoid = 'textrels'::regclass then 'textrel' \
when tableoid = 'texts'::regclass then 'text' \
when tableoid = 'threadrels'::regclass then 'threadrel' \
when tableoid = 'threads'::regclass then 'thread' \
when tableoid = 'topicrels'::regclass then 'topicrel' \
when tableoid = 'topics'::regclass then 'topic' \
when tableoid = 'userrels'::regclass then 'userrel' \
when tableoid = 'users'::regclass then 'user' \
end as type`;

function broadcast (entity) {
	pg.notify(config.connStr, channel, entity);
}

cache.onChange((changes) => {
	winston.info(changes);
	const cb = (key, range, err, results) => {
		if (err) {
			winston.error(err);
			return;
		}
		bus.emit('setstate', {
			knowledge: { [key]: [ range ] },
			indexes: { [key]: results },
			source: 'postgres'
		});
	};

	if (changes.queries) {
		for (const key in changes.queries) {
			if (key === 'entities') {
				const ids = Object.keys(changes.queries.entities),
					typeToEntities = {
						note: [],
						item: [],
						rel: [],
						user: []
					};

				ids.forEach((id) => {
					const _split = id.split('_');
					let type;

					if (_split.length === 2) type = 'note';
					else if (_split.length === 1) type = 'rel';
					else if (id.length >= 36) type = 'item';
					else type = 'user';

					typeToEntities[type].push(id);
				});

				for (const i in typeToEntities) {
					if (!typeToEntities[i].length) continue;

					pg.read(config.connStr, {
						$: `select *, ${TYPE_SEGMENT} from &{type} where id in (&(ids))`,
						ids: typeToEntities[i],
						type: i
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
							state.entities[i.id] = new Types[entity.type](entity);
						});

						bus.emit('setstate', state);
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
	bus.emit('statechange', payload);
});

bus.on('setstate', (changes, next) => {
	const counter = new Counter();

	if (changes.source === 'postgres') {
		next();
		return;
	}

	if (changes.entities) {
		const sql = [];

		winston.info('Got few entities to update');
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

			results.map((row) => {
				for (const col in row) {
					row[col] = new Types[col](row[col]);
				}
			});
			winston.info('PgWrite Results', results[0].rows);
			results.forEach((result) => broadcast(result.rows[0]));
			counter.dec();
		});
	}

	if (changes.queries) {
		const response = changes.response = {},
			cb = (key, err, results) => {
				if (err) { jsonop(response, { app: { error: err } }); }
				jsonop(response, { indexes: { [key]: results } });
				counter.dec();
			};

		for (const key in changes.queries) {
			for (const range of changes.queries[key]) {
				counter.inc();
				cache.query(key, range, cb.bind(null, key));
			}
		}
	}

	counter.then(next);
});
