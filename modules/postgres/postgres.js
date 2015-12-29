const jsonop = require("jsonop"),
	Counter = require("../lib/counter"),
	pg = require("../lib/pg"),
	log = require("../lib/log"),
	queryHandlers = require("./queries"),
	entityHandlers = require("./entities");

const { bus, cache, config } = require("../core");

function broadcast (entity) {
	const channel = "heyneighbor", payload = JSON.stringify(entity);

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
		callback(null, results);
	}
}

function runAction (handler, action, callback) {
	pg.write(config.connStr, handler(action), (err) => {
		if (err) return callback(err);
	});
}

cache.onChange((changes) => {
	const cb = (err, results) => {
		if (err) { return log.e(err); }
		cache.setState(results);
	};

	if (changes.queries) {
		for (const key in changes.queries) {
			const query = cache.keyToSlice(key, changes.queries[key]);

			runQuery(queryHandlers[query.type], query, null, 0, cb);
		}
	}
});

pg.onNotification((payload) => {
	bus.emit("postchange", JSON.parse(payload));
});

bus.on("prechange", (changes, next) => {
	const counter = new Counter();

	if (changes.entities) {
		const cb = (entity) => { broadcast(entity); counter.dec(); };

		for (const id in changes.entities) {
			const entity = changes.entities[id];

			counter.inc();
			runAction(
				entityHandlers[entity.type], entity, cb.bind(null, entity)
			);
		}
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
