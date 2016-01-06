const pg = require("../../lib/pg"),
	constants = require("../../lib/constants"),
	{ TABLES, COLUMNS, TYPES } = require("./schema");

module.exports = function (slice, range) {
	const parts = [];

	parts.push('SELECT * FROM "' + TABLES[TYPES[slice.type]] + '"');

	if (slice.join) {
		for (const type in slice.join) {
			parts.push(
				'LEFT OUTER JOIN "' + TABLES[TYPES[type]] + '" ON "' +
				TABLES[TYPES[type]] + '"."' + slice.join[type] + '" = "' +
				TABLES[TYPES[slice.type]] + '"."id"'
			);
		}
	}

	if (slice.link) {
		for (const type in slice.link) {
			parts.push(
				'LEFT OUTER JOIN "' + TABLES[TYPES[type]] + '" ON "' +
				TABLES[TYPES[slice.type]] + '"."' + slice.join[type] + '" = "' +
				TABLES[TYPES[type]] + '"."id"'
			);
		}
	}

	if (slice.filter) {
	}

	if (slice.order) {
	}

	return pg.cat(parts, " ");
};
