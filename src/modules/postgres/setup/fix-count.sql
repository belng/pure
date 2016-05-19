UPDATE rooms set counts = '{}';
UPDATE threads set counts = '{}';
UPDATE users set counts = '{}';

UPDATE rooms SET counts = json_cat(counts, json_build_object(
  'children',
  (SELECT count(*) FROM threads WHERE parents @> ARRAY[rooms.id])
)::jsonb) WHERE (SELECT count(*) FROM threads WHERE parents @> ARRAY[rooms.id]) <> 0;

UPDATE rooms SET counts = json_cat(counts, json_build_object(
  'follower',
  (SELECT count(*) FROM roomrels WHERE roles @> '{3}' AND item = rooms.id)
)::jsonb) WHERE (SELECT count(*) FROM roomrels WHERE roles @> '{3}' AND item = rooms.id) <> 0;

UPDATE rooms SET counts = json_cat(counts, json_build_object(
  'visitor',
  (SELECT count(*) FROM roomrels WHERE roles @> '{1}' AND item = rooms.id)
)::jsonb) WHERE (SELECT count(*) FROM roomrels WHERE roles @> '{1}' AND item = rooms.id) <> 0;

UPDATE rooms SET counts = json_cat(counts, json_build_object(
  'home',
  (SELECT count(*) FROM roomrels WHERE roles @> '{41}' AND item = rooms.id)
)::jsonb) WHERE (SELECT count(*) FROM roomrels WHERE roles @> '{41}' AND item = rooms.id) <> 0;

UPDATE rooms SET counts = json_cat(counts, json_build_object(
  'work',
  (SELECT count(*) FROM roomrels WHERE roles @> '{42}' AND item = rooms.id)
)::jsonb) WHERE (SELECT count(*) FROM roomrels WHERE roles @> '{42}' AND item = rooms.id) <> 0;

UPDATE rooms SET counts = json_cat(counts, json_build_object(
  'hometown',
  (SELECT count(*) FROM roomrels WHERE roles @> '{43}' AND item = rooms.id)
)::jsonb) WHERE (SELECT count(*) FROM roomrels WHERE roles @> '{43}' AND item = rooms.id) <> 0;


UPDATE threads SET counts = json_cat(counts, json_build_object(
  'children',
  (SELECT count(*) FROM texts WHERE parents @> ARRAY[threads.id])
)::jsonb) WHERE (SELECT count(*) FROM texts WHERE parents @> ARRAY[threads.id]) <> 0;

UPDATE threads SET counts = json_cat(counts, json_build_object(
'follower',
(SELECT count(*) FROM threadrels WHERE roles @> '{3}' AND item = threads.id)
)::jsonb) WHERE (SELECT count(*) FROM threadrels WHERE roles @> '{3}' AND item = threads.id) <> 0;

UPDATE threads SET counts = json_cat(counts, json_build_object(
'visitor',
(SELECT count(*) FROM threadrels WHERE roles @> '{1}' AND item = threads.id)
)::jsonb) WHERE (SELECT count(*) FROM threadrels WHERE roles @> '{1}' AND item = threads.id) <> 0;

UPDATE threads SET counts = json_cat(counts, json_build_object(
'mentioned',
(SELECT count(*) FROM threadrels WHERE roles @> '{2}' AND item = threads.id)
)::jsonb) WHERE (SELECT count(*) FROM threadrels WHERE roles @> '{2}' AND item = threads.id) <> 0;

UPDATE users SET counts = json_cat(counts, json_build_object(
  'texts',
  (SELECT count(*) FROM texts WHERE creator = users.id)
)::jsonb) WHERE (SELECT count(*) FROM texts WHERE creator = users.id) <> 0;

UPDATE users SET counts = json_cat(counts, json_build_object(
'threads',
(SELECT count(*) FROM threads WHERE creator=users.id)
)::jsonb) WHERE (SELECT count(*) FROM threads WHERE creator=users.id) <> 0;
