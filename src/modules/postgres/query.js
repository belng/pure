

import pg from '../../lib/pg';
import { TABLES, TYPES } from '../../lib/schema';

const MAX_LIMIT = 1024;

function propOp (prop, op) {
	if (prop.substr(-op.length) === op) {
		return prop.substr(0, prop.length - op.length);
	} else {
		return false;
	}
}

function fromPart (slice) {
	const fields = [], joins = [];

	fields.push('row_to_json("' + TABLES[TYPES[slice.type]] + '.*") as "' + slice.type + '"');
	joins.push('"' + TABLES[TYPES[slice.type]] + '"');

	if (slice.join) {
		for (const type in slice.join) {
			joins.push(
				'LEFT OUTER JOIN "' + TABLES[TYPES[type]] + '" ON "' +
				TABLES[TYPES[type]] + '"."' + slice.join[type] + '" = "' +
				TABLES[TYPES[slice.type]] + '"."id"'
			);
			fields.push('row_to_json("' + TABLES[TYPES[type]] + '.*") as "' + type + '"');
		}
	}

	if (slice.link) {
		for (const type in slice.link) {
			joins.push(
				'LEFT OUTER JOIN "' + TABLES[TYPES[type]] + '" ON "' +
				TABLES[TYPES[slice.type]] + '"."' + slice.join[type] + '" = "' +
				TABLES[TYPES[type]] + '"."id"'
			);

			fields.push('row_to_json("' + TABLES[TYPES[type]] + '.*") as "' + type + '"');
		}
	}

	return pg.cat(['SELECT ', pg.cat(fields, ','), 'FROM', pg.cat(joins, ' ') ], ' ');
}

function wherePart (filter) {
	const sql = [];
	let name;

	for (const prop in filter) {
		if ((name = propOp(prop, 'Gt'))) {
			sql.push(`"${name}" > &{${prop}}`);
		} else if ((name = propOp(prop, 'Lt'))) {
			sql.push(`"${name}" < &{${prop}}`);
		} else if ((name = propOp(prop, 'In'))) {
			sql.push(`"${name}" IN &{${prop}}`);
		} else if ((name = propOp(prop, 'Neq'))) {
			sql.push(`"${name}" <> &{${prop}}`);
		} else if ((name = propOp(prop, 'Gte'))) {
			sql.push(`"${name}" >= &{${prop}}`);
		} else if ((name = propOp(prop, 'Lte'))) {
			sql.push(`"${name}" <= &{${prop}}`);
		} else if ((name = propOp(prop, 'Cts'))) {
			sql.push(`"${name}" @> &{${prop}}`);
		} else if ((name = propOp(prop, 'Ctd'))) {
			sql.push(`"${name}" <@ &{${prop}}`);
		} else if ((name = propOp(prop, 'Mts'))) {
			sql.push(`"${name}" @@ &{${prop}}`);
		} else {
			sql.push(`"${prop}" = &{${prop}}`);
		}
	}

	filter = Object.create(filter);
	filter.$ = 'WHERE ' + sql.join(' AND ');
	return filter;
}

function orderPart(order, limit) {
	if (limit < 0) {
		return `ORDER BY "${order}" DESC LIMIT ${-limit}`;
	} else {
		return `ORDER BY "${order}" ASC LIMIT ${limit}`;
	}
}

function simpleQuery(slice, limit) {
	return pg.cat([
		fromPart(slice),
		wherePart(slice.filter),
		orderPart(slice.order, limit)
	], ' ');
}

function boundQuery (slice, start, end) {
	let query;

	slice.filter[slice.order + 'Gte'] = start;
	slice.filter[slice.order + 'Lte'] = end;
	query = simpleQuery(slice, MAX_LIMIT);
	delete slice.filter[slice.order + 'Gte'];
	delete slice.filter[slice.order + 'Lte'];

	return query;
}

function beforeQuery (slice, start, before, exclude) {
	let query;

	slice.filter[slice.order + (exclude ? 'Lt' : 'Lte')] = start;
	query = simpleQuery(slice, Math.max(-MAX_LIMIT, -before));
	delete slice.filter[slice.order + (exclude ? 'Lt' : 'Lte')];

	return pg.cat([
		'SELECT * FROM (',
		query,
		{
			$: `) r ORDER BY "&{type}"->'&{order}' ASC`,
			type: slice.type,
			order: slice.order
		}

	], ' ');
}

function afterQuery (slice, start, after, exclude) {
	let query;

	slice.filter[slice.order + (exclude ? 'Gt' : 'Gte')] = start;
	query = simpleQuery(slice, Math.min(MAX_LIMIT, after));
	delete slice.filter[slice.order + (exclude ? 'Gt' : 'Gte')];

	return query;
}

module.exports = function (slice, range) {
	if (slice.order) {
		if (range.length === 2) {
			return boundQuery(slice, range[0], range[1]);
		} else {
			if (range[1] > 0 && range[2] > 0) {
				return pg.cat([
					beforeQuery(slice, range[0], range[1], true),
					'UNION ALL',
					afterQuery(slice, range[0], range[2])
				], ' ');
			} else if (range[1] > 0) {
				return beforeQuery(slice, range[0], range[1]);
			} else if (range[2] > 0) {
				return afterQuery(slice, range[0], range[2]);
			}
		}
	} else {
		return simpleQuery(slice, MAX_LIMIT);
	}
};
