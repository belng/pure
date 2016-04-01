\echo 'Connecting to olsb'
\c hn heyneighbor hndb.c1mimw7qcvsb.ap-southeast-1.rds.amazonaws.com
--\c oldsb

DROP TABLE IF EXISTS id_map;

CREATE TABLE id_map (
	newid uuid,
	oldid text primary key
);

INSERT INTO id_map (newid, oldid) SELECT gen_random_uuid(), id FROM entities WHERE type = 'room';
INSERT INTO id_map (newid, oldid) SELECT gen_random_uuid(), id FROM threads;

DROP FUNCTION IF EXISTS getMetadata(t text);

CREATE FUNCTION getMetadata(t text) RETURNS jsonb AS $$

	const numbers = [
		'height',
		'width',
		'thumbnail_height',
		'thumbnail_width'
	];

	const parts = t.match(/\[!\[([^\]]+)+\]\(([^\)]+)\)\]\(([^\)]+)\)/);
	if (parts && parts.length) {

		const title = parts[1];
		const thumbnailUrlParts = parts[2].split('#');
		const originalUrl = parts[3];

		const metadata = {
			type: 'photo',
			url: originalUrl,
			thumbnail_url: thumbnailUrlParts[0].trim(),
			title: title
		};

		const data = thumbnailUrlParts[1];

		if (data) {
			const pairs = data.split('&');
			var i = 0;
			var l = pairs.length;
			for (i, l; i < l; i++) {
				const kv = pairs[i].split('=');
				metadata[kv[0]] = numbers.indexOf(kv[0]) > -1 ? parseInt(kv[1], 10) : kv[1];
			}
		}

		return JSON.stringify({ photo: metadata });
		}
		else {
			return null;
		}
$$ LANGUAGE plv8 IMMUTABLE;


\echo 'Connecting to pure'
\c aravind aravind localhost
--\c pure localhost

--Drop and create tables

\i ./1.sql
\i ./dblink.sql

--Migration data sql queries
\echo 'Executing Rooms migration query'
INSERT
	INTO rooms(
		id,
		name,
		body,
		parents,
		tags,
		createtime,
		creator,
		deletetime,
		meta,
		params,
		terms,
		updater,
		updatetime,
		counts,
		identities)
	SELECT *
	FROM dblink ('SELECT '
			'(SELECT newid FROM id_map WHERE oldid = entities.id) AS id, '
			'guides->>''displayName'' AS name, '
			'description AS body, '
			'NULL AS parents, '
			'NULL AS tags, '
			'ROUND(EXTRACT(EPOCH FROM current_timestamp)*1000) AS createtime, '
			'NULL AS creator, '
			'ROUND(EXTRACT(EPOCH FROM deletetime)*1000) AS deletetime, '
			'json_build_object(''picture'', picture) AS meta, '
			'(SELECT '
				'json_object_agg(name, value) '
				'FROM jsonb_each(params) '
				'AS fields (name, value) '
				'WHERE name <> ''places'''
			') AS params, '
			'terms AS terms, '
			'NULL AS updater, '
			'ROUND(EXTRACT(EPOCH FROM current_timestamp)*1000) AS updatetime, '
			'NULL AS counts, '
			'NULL AS identities '
		'FROM entities WHERE type=''room''')
	AS t(
		id uuid,
		name text,
		body text,
		parents uuid[],
		tags smallint[],
		createtime bigint,
		creator text,
		deletetime bigint,
		meta jsonb,
		params jsonb,
		terms tsvector,
		updater text,
		updatetime bigint,
		counts jsonb,
		identities text[]);


--Users migration query
\echo 'Executing Users migration query'

INSERT
	INTO users(
		id,
		name,
		identities,
		createtime,
		deletetime,
		tags,
		locale,
		counts,
		meta,
		params,
		presence,
		presencetime,
		processid,
		resources,
		timezone,
		updatetime)
	SELECT *
	FROM dblink ('SELECT '
			'id AS id, '
			'guides->>''displayName'' AS name, '
			'(SELECT array_agg(identity) FROM unnest(identities) AS identity WHERE identity like ''mailto:%'') AS identities, '
			'ROUND(EXTRACT(EPOCH FROM createtime)*1000) AS createtime, '
			'ROUND(EXTRACT(EPOCH FROM deletetime)*1000) AS deletetime, '
			'''{4}'' AS tags, '
			'0::smallint AS locale, '
			'NULL AS counts, '
			'json_build_object(''picture'', picture) AS meta, '
			'(SELECT '
				'json_object_agg(name, value) '
				'FROM jsonb_each(params) '
				'AS fields (name, value) '
				'WHERE name <> ''places'''
			') AS params, '
			'NULL AS presence, '
			'NULL AS presencetime, '
			'NULL AS processid, '
			'NULL AS resources, '
			'timezone AS timezone ,'
			'NULL AS updatetime '
		'FROM entities WHERE type=''user''')
	AS t(
		id text,
		name text,
		identities text[],
		createtime bigint,
		deletetime bigint,
		tags smallint[],
		locale smallint,
		counts jsonb,
		meta jsonb,
		params jsonb,
		presence smallint,
		presencetime bigint,
		processid smallint,
		resources jsonb,
		timezone smallint,
		updatetime bigint );


	--Threads migration query
	\echo 'Executing Threads migration query'

	INSERT
		INTO threads(
			id,
			name,
			body,
			parents,
			tags,
			createtime,
			creator,
			deletetime,
			meta,
			params,
			terms,
			updater,
			updatetime,
			counts,
			score)
		SELECT *
		FROM dblink ('SELECT '
				'(SELECT newid FROM id_map WHERE oldid = id) AS id, '
				'title AS name, '
				'(SELECT text FROM texts WHERE id = threads.id) AS body, '
				'ARRAY[(SELECT newid FROM id_map WHERE oldid="to")]::uuid[] AS parents, '
				'(SELECT array_agg( '
					'CASE '
						'WHEN tag = ''hidden'' THEN -1 '
						'WHEN tag = ''image'' THEN 3 '
						'ELSE 1 '
					'END '
				') FROM unnest(tags) tag) AS tags, '
				'round(EXTRACT(EPOCH FROM starttime)*1000) AS createtime, '
				'"from" AS creator, '
				'NULL AS deletetime, '
				'NULL AS meta, '
				'NULL AS params, '
				'terms AS terms, '
				'updater AS updater, '
				'round(EXTRACT(EPOCH FROM updatetime)*1000) AS updatetime, '
				'json_build_object(''children'', length) AS counts, '
				'NULL AS score '
			'FROM threads')
		AS t(
			id uuid,
			name text,
			body text,
			parents uuid[],
			tags smallint[],
			createtime bigint,
			creator text,
			deletetime bigint,
			meta jsonb,
			params jsonb,
			terms tsvector,
			updater text,
			updatetime bigint,
			counts jsonb,
			score real);


--Texts migration query
\echo 'Executing Texts migration query'
INSERT
	INTO texts(
		id,
		name,
		body,
		parents,
		tags,
		createtime,
		creator,
		deletetime,
		meta,
		params,
		terms,
		updater,
		updatetime,
		counts)
	SELECT *
	FROM dblink ('SELECT '
			'gen_random_uuid() AS id, '
			'title AS name, '
			'CASE '
				'WHEN tags @> ''{image}'' '
					'THEN ('
						'SELECT m[1] '
						'FROM regexp_matches(text, ''\[!\[[^\]]+]\([^)]+\)]\(([^)]+)'') '
						'AS r(m) LIMIT 1) '
				'ELSE text '
			'END AS body, '
			'ARRAY[(SELECT newid FROM id_map WHERE oldid = "thread"), '
				'(SELECT newid FROM id_map WHERE oldid = "to")]::uuid[] AS parents, '
			'(SELECT array_agg( '
				'CASE '
					'WHEN tag = ''hidden'' THEN -1 '
					'WHEN tag = ''image'' THEN 3 '
					'ELSE 1 '
				'END '
			') FROM unnest(tags) tag) AS tags, '
			'ROUND(EXTRACT(EPOCH FROM "time")*1000) AS createtime, '
			'"from" AS creator, '
			'NULL AS deletetime, '
			'getMetadata(text) AS meta, '
			'NULL AS params, '
			'NULL AS terms, '
			'updater AS updater, '
			'ROUND(EXTRACT(EPOCH FROM updatetime)*1000) AS updatetime, '
			'NULL AS counts '
		'FROM texts '
		'WHERE id <> thread')
	AS t(
		id uuid,
		name text,
		body text,
		parents uuid[],
		tags smallint[],
		createtime bigint,
		creator text,
		deletetime bigint,
		meta jsonb,
		params jsonb,
		terms tsvector,
		updater text,
		updatetime bigint,
		counts jsonb);


\echo 'table for updating identities in rooms.'
DROP TABLE IF EXISTS placeid_map;

CREATE TABLE placeid_map (
	room_name text,
	placeid text
);

\copy placeid_map(room_name, placeid) from './location.csv' CSV HEADER delimiter ','

UPDATE rooms SET identities = ARRAY((SELECT 'place:' || placeid FROM placeid_map WHERE room_name = rooms.name))::text[];
