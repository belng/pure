const jsonop = require("jsonop"),
	Counter = require("../lib/counter"),
	pg = require("../lib/pg"),
	log = require("../lib/log"),
	queryHandler = require("./queries"),
	entityHandler = require("./entities");

const { bus, cache, config } = require("../core");

function broadcast (entity) {
	const channel = "heyneighbor", payload = JSON.stringify(entity);

	pg.notify(channel, payload);
}

cache.onChange((changes) => {
	const cb = (key, range, err, results) => {
		if (err) { return log.e(err); }
		cache.setState({
			knowledge: { [key]: [ range ] },
			indexes: { [key]: results }
		});
	};

	if (changes.queries) {
		for (const key in changes.queries) {
			for (const range of changes.queries[key]) {
				pg.read(
					config.connStr,
					queryHandler(cache.keyToSlice(key), range),
					cb.bind(null, key, range)
				);
			}
		}
	}
});

pg.onNotification((payload) => {
	bus.emit("statechange", JSON.parse(payload));
});

bus.on("setstate", (changes, next) => {
	const counter = new Counter();

	if (changes.entities) {
		const sql = [];

		for (const id in changes.entities) {
			sql.push(entityHandler(changes.entities[id]));
		}
		counter.inc();
		pg.write(config.connStr, sql, (err, results) => {
			if (err) { counter.err(err); }
			results.forEach((result) => broadcast(result[0]));
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
