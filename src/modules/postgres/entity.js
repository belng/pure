import * as pg from '../../lib/pg';
import { TABLES, COLUMNS } from '../../lib/schema';
import * as Constants from '../../lib/Constants';
import jsonop from 'jsonop';
import defaultOps from './../../lib/defaultOps';

export default function (entity) {
	// TODO: add validation for type else this code crashes.
	const names = Object.keys(entity).filter(
		name => COLUMNS[entity.type].indexOf(name) >= 0
	);

	const ops = jsonop(defaultOps, entity.__op__ || {});

	if (entity.type === Constants.TYPE_ROOM) {
		names.push('terms');
	}

	names.splice(names.indexOf('type'), 1);

	if (entity.create) { // INSERT
		return pg.cat([
			`INSERT INTO "${TABLES[entity.type]}" (`,
			'"' + names.map(name => name.toLowerCase()).join('", "') + '"',
			') VALUES (',
			pg.cat(names.map(name => {
				switch (name) {
				case 'terms':
					return {
						$: "to_tsvector(&{locale}, &{name} || ' ' || &{body})",
						locale: 'english',
						name: entity.name,
						body: entity.body
					};
				default:
					return {
						$: `&{${name}}`,
						[name]: entity[name]
					};
				}
			}), ', '),
			{
				$: ') RETURNING *, &{type}::smallint as "type"',
				type: entity.type
			}
		], ' ');
	} else { // UPDATE
		return pg.cat([
			'UPDATE "' + TABLES[entity.type] + '" SET',
			pg.cat(names.map(name => {
				switch (name) {
				case 'id':
				case 'createTime':
					return false; // do not update this column.
				case 'terms':
					return {
						$: '"terms" = to_tsvector(&{locale}, ' +
							(entity.name ? '&{name}' : '"name"') +
							" || ' ' || " +
							(entity.body ? '&{body}' : '"body"') +
							')',
						locale: 'english',
						name: entity.name,
						body: entity.body
					};
				case 'identities': // TODO: find a way to merge and do uniq on the identities
					return {
						$: '"identities" = &{identities}',
						identities: entity[name]
					};
				case 'meta':
				case 'params':
				case 'data':
				case 'resources':
					return {
						$: `"${name}" = jsonop("${name}"::jsonb, &{${name}}::jsonb, &{${name}_op}::jsonb)`,
						[name]: entity[name],
						[name + '_op']: ops[name] || {}
					};
				default:
					return {
						$: `"${name.toLowerCase()}" = &{${name}}`,
						[name]: entity[name]
					};
				}
			}).filter(sql => sql), ', '),

			'WHERE',
			entity.id ? {
				$: '"id" = &{id}',
				id: entity.id
			} :
			entity.user && entity.item ? {
				$: '"user" = &{user} AND "item" = &{item}',
				user: entity.user,
				item: entity.item
			} :
			entity.user && entity.event && entity.group ? {
				$: '"user" = &{user} AND "event" = &{event}' +
					' AND "group" = &{group}',
				user: entity.user,
				event: entity.item,
				group: entity.group
			} : 'FALSE',
			{
				$: 'RETURNING *, &{type}::smallint as "type"',
				type: entity.type
			}
		], ' ');
	}
}
