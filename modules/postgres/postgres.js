const jsonop = require("jsonop"),
	Counter = require("../../lib/counter"),
	pg = require("../../lib/pg"),
	log = console,
	queryHandler = require("./query"),
	entityHandler = require("./entity");

const { bus, cache, config } = require("../../core");

const channel = "heyneighbor";

function broadcast (entity) {
	pg.notify(config.connStr, channel, entity);
}

cache.onChange((changes) => {
	const cb = (key, range, err, results) => {
		if (err) { return log.error(err); }
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

pg.listen(config.connStr, channel, (payload) => {
	bus.emit("statechange", payload);
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
			if (err) { return counter.err(err); }
			console.log("PgWrite Results", results[0].rows);
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
