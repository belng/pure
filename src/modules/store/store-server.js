import jsonop from 'jsonop';
import Cache from 'sbcache';
import Counter from '../../lib/counter.js';
import './querykeyrange';
import pg from '../../lib/pg.js';
import log from '../../lib/log.js';
import queryHandlers from './postgres/queries';
import actionHandlers from './postgres/updates';
let core, cache, config;

function broadcast (entity) {
	let channel, payload = JSON.stringify(entity);
	channel = 'HeyNeighbor';
	pg.notify(channel, payload);
}

function runQuery(handlers, query, results, i, callback) {
	let sql;
	if (i < handlers.length && (sql = handlers[i](query, results))) {
		log.d(sql);
		pg.read(config.connStr, sql, (err, res) => {
			if (err) return callback(err);
			runQuery(handlers, query, res, i + 1, callback);
		});
	} else {
		callback();
	}
}

function runAction (handler, action, callback) {
	pg.write(config.connStr, handler(action), (err) => {
		if (err) return callback(err);
	});
}

module.exports = (c) => {
	core = c;
	cache = core.cache = new Cache();
	config = core.config.store;

	cache.onChange((changes) => {
		if (changes.queries) {
			for (let key in changes.queries) {
				let query = keyrangeToQuery(key, changes.queries[key]);
				runQuery(
					queryHandlers[query.type], query, null, 0,
					() => cache.setState(query.results)
				);
			}
		}
	});

	pg.onNotification((payload) => {
		core.emit('stateChange', JSON.parse(payload));
	});

	core.on('state', (changes, next) => {
		let counter = new Counter();

		if (changes.entities) {
			for (let entity of changes.entities) {
				counter.inc();
				runAction(
					actionHandlers[entity.type], entity,
					() => { broadcast(entity); counter.dec(); }
				);
			}
		}

		if (changes.queries) {
			let response = changes.response = {};
			for (let key in changes.queries) {
				counter.inc();
				cache.query(key, changes.queries[key], (err, results) => {
					jsonop(response, { entities: results });
					counter.dec();
				});
			}
		}

		counter.then(next);
	});
};
