
import * as pg from '../../lib/pg';
import { TABLES, TYPES } from '../../lib/schema';

import winston from 'winston';
const MAX_LIMIT = 1024;

function propOp (prop, op) {
	const i = prop.lastIndexOf('_');

	if (i > 0) {
		return prop.substr(i + 1, prop.length) === op && prop.substr(0, i);
	} else {
		return false;
	}
}

function fromPart (slice) {
	const fields = [], joins = [];

	fields.push('row_to_json("' + TABLES[TYPES[slice.type]] + '".*)::jsonb as "' + slice.type + '"');
	joins.push('"' + TABLES[TYPES[slice.type]] + '"');

	if (slice.join) {
		for (const type in slice.join) {
			joins.push(
				'LEFT OUTER JOIN "' + TABLES[TYPES[type]] + '" ON "' +
				TABLES[TYPES[type]] + '"."' + slice.join[type] + '" = "' +
				TABLES[TYPES[slice.type]] + '"."id"'
			);
			fields.push('row_to_json("' + TABLES[TYPES[type]] + '".*)::jsonb as "' + type + '"');
		}
	}

	if (slice.link) {
		for (const type in slice.link) {
			joins.push(
				'LEFT OUTER JOIN "' + TABLES[TYPES[type]] + '" ON "' +
				TABLES[TYPES[slice.type]] + '"."' + slice.join[type] + '" = "' +
				TABLES[TYPES[type]] + '"."id"'
			);

			fields.push('row_to_json("' + TABLES[TYPES[type]] + '".*)::jsonb as "' + type + '"');
		}
	}

	return pg.cat([ 'SELECT ', pg.cat(fields, ','), 'FROM', pg.cat(joins, ' ') ], ' ');
}

function wherePart (f) {
	const sql = [];
	let filter = f, name;


	for (const prop in filter) {
		if ((name = propOp(prop, 'gt'))) {
			sql.push(`"${name}" > &{${prop}}`);
		} else if ((name = propOp(prop, 'lt'))) {
			sql.push(`"${name.toLowerCase()}" < &{${prop}}`);
		} else if ((name = propOp(prop, 'in'))) {
			sql.push(`"${name.toLowerCase()}" IN &{${prop}}`);
		} else if ((name = propOp(prop, 'neq'))) {
			sql.push(`"${name.toLowerCase()}" <> &{${prop}}`);
		} else if ((name = propOp(prop, 'gte'))) {
			sql.push(`"${name.toLowerCase()}" >= &{${prop}}`);
		} else if ((name = propOp(prop, 'lte'))) {
			sql.push(`"${name.toLowerCase()}" <= &{${prop}}`);
		} else if ((name = propOp(prop, 'cts'))) {
			sql.push(`"${name.toLowerCase()}" @> &{${prop}}`);
		} else if ((name = propOp(prop, 'ctd'))) {
			sql.push(`"${name.toLowerCase()}" <@ &{${prop}}`);
		} else if ((name = propOp(prop, 'mts'))) {
			sql.push(`"${name.toLowerCase()}" @@ &{${prop}}`);
		} else {
			sql.push(`"${name.toLowerCase()}" = &{${prop}}`);
		}
	}

	filter = Object.create(filter);
	filter.$ = 'WHERE ' + sql.join(' AND ');
	return filter;
}

function orderPart(order, limit) {
	if (limit < 0) {
		return `ORDER BY "${order.toLowerCase()}" DESC LIMIT ${-limit}`;
	} else {
		return `ORDER BY "${order.toLowerCase()}" ASC LIMIT ${limit}`;
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
	slice.filter[slice.order + '_gte'] = start;
	slice.filter[slice.order + '_lte'] = end;
	const query = simpleQuery(slice, MAX_LIMIT);

	delete slice.filter[slice.order + '_gte'];
	delete slice.filter[slice.order + '_lte'];

	return query;
}

function beforeQuery (slice, start, before, exclude) {
	slice.filter[slice.order + (exclude ? '_lt' : '_lte')] = start;
	const query = simpleQuery(slice, Math.max(-MAX_LIMIT, -before));

	delete slice.filter[slice.order + (exclude ? '_lt' : '_lte')];

	return pg.cat([
		'SELECT * FROM (',
		query,
		{
			$: `) r ORDER BY ${slice.type.toLowerCase()}->\'&{order}\' ASC`,
			order: slice.order.toLowerCase()
		}

	], ' ');
}

function afterQuery (slice, start, after, exclude) {
	if (!slice.filter) slice.filter = {};
	slice.filter[slice.order + (exclude ? '_gt' : '_gte')] = start;
	const query = simpleQuery(slice, Math.min(MAX_LIMIT, after));

	delete slice.filter[slice.order + (exclude ? '_gt' : '_gte')];

	return query;
}

export default function (slice, range) {
	let query;

	winston.debug(JSON.stringify({ slice, range }));

	if (slice.order) {
		if (range.length === 2) {
			query = boundQuery(slice, range[0], range[1]);
		} else {
			if (range[1] > 0 && range[2] > 0) {
				query = pg.cat([
					beforeQuery(slice, range[0], range[1], true),
					'UNION ALL',
					afterQuery(slice, range[0], range[2])
				], ' ');
			} else if (range[1] > 0) {
				query = beforeQuery(slice, range[0], range[1]);
			} else if (range[2] > 0) {
				query = afterQuery(slice, range[0], range[2]);
			}
		}
	} else {
		query = simpleQuery(slice, MAX_LIMIT);
	}

	return query;
}
