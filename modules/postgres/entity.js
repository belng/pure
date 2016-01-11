const pg = require("../../lib/pg"),
	constants = require("../../lib/constants"),
	{ TABLES, COLUMNS } = require("./schema");

module.exports = function (entity) {
	const names = Object.keys(entity).filter(
		name => COLUMNS[entity.type].indexOf(name) >= 0
	);

	if (entity.type === constants.TYPE_ROOM) {
		names.push("terms");
	}

	if (entity.createTime) { // INSERT
		return pg.cat([
			'INSERT INTO "' + TABLES[entity.type] + '" (',
			'"' + names.join('", "') + '"',
			") VALUES (",
			pg.cat(names.map(name => {
				switch (name) {
				case "terms":
					return {
						$: "to_tsvector(&{locale}, &{name} || ' ' || &{body})",
						locale: "english",
						name: entity.name,
						body: entity.body
					};
				default:
					return {
						$: `&{${name}}`,
						[name]: entity[name]
					};
				}
			}), ", "),
			") RETURNING *"
		], " ");
	} else { // UPDATE
		return pg.cat([
			'UPDATE "' + TABLES[entity.type] + '" SET',
			pg.cat(names.map(name => {
				switch (name) {
				case "id":
				case "createTime":
					return false; // do not update this column.
				case "terms":
					return {
						$: '"terms" = to_tsvector(&{locale}, ' +
							(entity.name ? "&{name}" : '"name"') +
							" || ' ' || " +
							(entity.body ? "&{body}" : '"body"') +
							")",
						locale: "english",
						name: entity.name,
						body: entity.body
					};
				case "meta":
				case "params":
				case "data":
				case "resources":
					return {
						$: `"${name}" = jsonop("${name}", &{${name}})`,
						[name]: entity[name]
					};
				default:
					return {
						$: `"${name}" = &{${name}}`,
						[name]: entity[name]
					};
				}
			}).filter(sql => sql), ", "),

			"WHERE",
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
			} : "FALSE",
			"RETURNING *"
		], " ");
	}

	return pg.cat([
		'INSERT INTO "' + TABLES[entity.type] + '" (',
		'"' + names.join('", "') + '"',
		") VALUES (",
		pg.cat(names.map(name => {
			switch (name) {
			case "terms":
				return {
					$: "to_tsvector(&{locale}, &{name} || ' ' || &{body})",
					locale: "english",
					name: entity.name,
					body: entity.body
				};
			}
		}), ", "),
		") ON CONFLICT DO UPDATE SET",
		"RETURNING *"
	]);
};
