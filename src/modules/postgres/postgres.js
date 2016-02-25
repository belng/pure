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

			/*
				FIXME: add a way to query for items.
				TODO: this is temp thing. only entities that are users are serverd right now.h
			 */
			if (key === 'entities') {
				const ids = Object.keys(changes.queries.entities);

				pg.read(config.connStr, {
					$: 'select *, \'user\' as "type" from users where id in (&(ids))',
					ids
				}, (err, r) => {
					if (err) {
						winston.error(err.message);
						return;
					}

					const state = {
						entities: {},
						source: 'postgres'
					};

					r.map((i) => {
						state.entities[i.id] = new Types[i.type](i);
					});

					bus.emit('setstate', state);
				});
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
