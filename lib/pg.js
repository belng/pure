"use strict";

const pg = require("pg"),
	logger = console, //require("winston"),
	events = require("events"),
	uid = require("./uid-server");

	// Variables for tracking and rolling back incomplete queries on shut down
const runningQueries = {},
	EventEmitter = events.EventEmitter;

let shuttingDown = false;

function cat (parts, delim) {
	delim = delim || " "; // eslint-disable-line no-param-reassign

	const q = { $: [] };

	parts.forEach((part) => {
		let paramName, suffix;

		if (typeof part === "string") {
			q.$.push(part);
			return;
		}

		function substitute (match, left, mid, right) {
			return left + (mid === paramName ? paramName + "_" + suffix : mid) +
				right;
		}

		for (paramName in part) {
			if (paramName === "$") { continue; }
			if (paramName in q && part[paramName] !== q[paramName]) {
				suffix = 1;
				while ((paramName + "_" + suffix) in q) { suffix++; }

				part.$ = part.$.replace(/(\&\{|\()(\w+)(\}|\))/g, substitute);
				q[paramName + "_" + suffix] = part[paramName];
			} else {
				q[paramName] = part[paramName];
			}
		}
		q.$.push(part.$);
	});

	q.$ = q.$.join(delim);

	return q;
}

exports.cat = cat;

function nameValues (record, delim) {
	const parts = [];
	let column, part;

	for (column in record) {
		part = { $: "\"" + column + "\"=&{" + column + "}" };
		part[column] = record[column];
		parts.push(part);
	}

	return cat(parts, delim || ", ");
}

function columns (record) {
	return Object.keys(record)
		.map((c) => { return "\"" + c + "\""; })
		.join(", ");
}

function values (record) {
	const cols = [], clause = {};
	let column;

	for (column in record) {
		cols.push("${" + column + "}");
		clause[column] = record[column];
	}

	clause.$ =  cols.join(", ");
	return clause;
}

function update (tableName, object) {
	return cat([
		"UPDATE \"" + tableName + "\" SET ",
		nameValues(object)
	], " ");
}

function insert (tableName, objects) {
	if (!objects) throw Error("CANT_INSERT_NOTHING");
	if (!Array.isArray(objects)) objects = [objects];

	const parts = [
		"INSERT INTO \"" + tableName + "\" (",
		columns(objects[0]),
		") VALUES"
	];

	parts.push("(", cat(objects.map(function (object) {
		return values(object);
	}), "), ("), ")");

	return cat(parts, " ");
}

function upsert (tableName, insertObject, keyColumns) {
	const updateObject = {}, whereObject = {};
	let col;

	for (col in insertObject) {
		if (keyColumns.indexOf(col) < 0) {
			updateObject[col] = insertObject[col];
		} else {
			whereObject[col] = insertObject[col];
		}
	}

	return [
		lock(keyColumns.sort().map(function (column) { return whereObject[column]; }).join(":")),
		cat([update(tableName, updateObject), "WHERE", nameValues(whereObject, " AND ")]),
		cat([
			"INSERT INTO \"" + tableName + "\" (",
			columns(insertObject),
			") SELECT ",
			values(insertObject),
			"WHERE NOT EXISTS (SELECT 1 FROM " + tableName,
			"WHERE", nameValues(whereObject, " AND "), ")"
		])
	];
}

exports.nameValues = nameValues;
exports.columns = columns;
exports.values = values;
exports.update = update;
exports.insert = insert;
exports.upsert = upsert;

// --------------------------------------------------------------------

function paramize (query) {
	var ixs = {}, sql, vals=[];
	function getIndex(p, v) {
		if(!(p in ixs)) {
			vals.push(v);
			ixs[p] = vals.length - 1;
		}
		return ixs[p];
	}

	function paren(p, v, wrap) {
		if(typeof v === 'undefined') {
			throw Error("Parameter " + p + " is undefined");
		}

		if(Array.isArray(v)) {
			var r = (wrap? "(": "") +
				v.map(function (iv, ix) { return paren(p + "-" + ix, iv, true); }).join(", ") +
				(wrap? ")": "");
			return r;
		} else {
			return "$" + (getIndex(p, v) + 1);
		}
	}

	if(!query.$) {
		logger.error("Invalid query, no $");
		throw Error("INVALID_QUERY");
	}

	sql = query.$.replace(/\&\{(\w+)\}/g, function (m, p) {
		return "$" + (getIndex(p, query[p]) + 1);
	}).replace(/\&\((\w+)\)/g, function (m, p) {
		return paren(p, query[p]);
	});
	logger.log(sql, vals);
	return { q: sql, v: vals };
}

exports.paramize = paramize;

exports.read = function (connStr, query, cb) {
	var start = Date.now();
	logger.log("PgRead start", query);
	pg.connect(connStr, function(error, client, done) {
		if (error) {
			logger.error("Unable to connect to " + connStr, error, query);
			done();
			return cb(error);
		}

		var qv = paramize(query);
		logger.log("Querying", qv);
		client.query(qv.q, qv.v, function(queryErr, result) {
			done();
			if(queryErr) {
				logger.error("Query error", queryErr, qv);
				return cb(queryErr);
			}
			logger.info("PgRead ", query, "result", result.rows.length, " rows in ", Date.now() - start, "ms");
			cb(null, result.rows);
		});
	});
};

exports.readStream = function (connStr, query) {
	var rstream = new EventEmitter();
	logger.log("PgReadStream ", query);
	pg.connect(connStr, function(error, client, done) {
		var stream;
		if (error) {
			logger.error("Unable to connect to " + connStr, error, query);
			done();
			return rstream.emit('error', error);
		}

		var qv = paramize(query);
		logger.log("Querying", qv);
		stream = client.query(qv.q, qv.v);

		stream.on('row', function (row, result) {
			rstream.emit('row', row, result);
		});
		stream.on('end', function (result) {
			done(); rstream.emit('end', result);
		});
		stream.on('error', function (err) {
			done(); rstream.emit('error', err);
		});
	});

	return rstream;
};

function rollback(error, client, done) {
	client.query('ROLLBACK', function(err) {
		logger.error("Rollback", error, err);
		return done(error);
	});
}

exports.write = function (connStr, queries, cb) {
	if (!queries || !queries.length) { return cb(null, []); }

	const start = Date.now();

	logger.log("PgWrite starting ", queries);
	pg.connect(connStr, (error, client, done) => {
		if (error) {
			logger.error("Unable to connect to " + connStr, error, queries);
			done();
			return cb(error);
		}

		if (shuttingDown) {
			return cb(Error("ERR_SERVER_SHUTDOWN"));
		}

		const id = uid();

		runningQueries[id] = client;

		function callback(err, results) {

			delete runningQueries[id];
			cb(err, results);
			done();
		}

		client.query("BEGIN", (err) => {
			const results = [];

			if (err) rollback(err, client, callback);

			function run(i) {
				if (shuttingDown) { return cb(Error("ERR_SERVER_SHUTDOWN")); }
				if (i < queries.length) {
					const qv = paramize(queries[i]);

					logger.log("Querying", qv);
					client.query(qv.q, qv.v, (queryErr, result) => {
						results[i] = result;
						if (queryErr) {
							logger.log("Rollback:", qv.q, qv.v);
							rollback(queryErr, client, callback);
						} else {
							run(i + 1);
						}
					});
				} else {
					client.query("COMMIT", (commitErr) => {
						logger.info("PgWrite", queries, "completed in ", Date.now() - start, "ms");
						callback(commitErr, results);
					});
				}
			}
			run(0);
		});
	});
};

function listen (connStr, channel, callback) {
	pg.connect(connStr, (error, client, done) => {
		if (error) {
			logger.error("Unable to connect to " + connStr, error, queries);
			done();
			return cb(error);
		}
		client.on("notification", (data) => {
			logger.log("Heard Notification", data);
			callback(JSON.parse(data.payload));
		});
		client.query("LISTEN " + channel);
	});
}

exports.listen = listen;

function notify (connStr, channel, data) {
	pg.connect(connStr, (error, client, done) => {
		if (error) {
			logger.error("Unable to connect to " + connStr, error, queries);
			done();
			return cb(error);
		}
		logger.log("PgNotify '" + JSON.stringify(data).replace(/([\\'])/g, '\\$1') + "'");
		client.query("NOTIFY " + channel + ", '" + JSON.stringify(data).replace(/([\\'])/g, '\\$1') + "'");
	});
}

exports.notify = notify;

function onShutDownSignal() {
	shuttingDown = true;
	logger.info("Process killed, rolling back queries");

	let ct = 1;

	// This is intentionally 1, not zero, and the comparison happens after the decrement, not before.
	// This is a weird roundabout way of ensuring that the process exits even if there are no running queries.
	// Perhaps rewrite?
	function done() {
		ct--;
		if (ct === 0) {
			logger.info("Complete: shutting down now.");
			process.exit(0);
		}
	}
	for (const key in runningQueries) {
		if (runningQueries.hasOwnProperty(key)) {
			ct++;
			rollback(new Error("error: SIGINT/SIGTERM"), runningQueries[key], done);
		}
	}
	done();
}

process.on('SIGINT', onShutDownSignal);
process.on('SIGTERM', onShutDownSignal);
