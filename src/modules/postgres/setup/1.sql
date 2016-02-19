-- entities ids are variable-length byte arrays.
-- For rooms and topics they are human-readable strings encoded with UTF-8.
-- They may contain any unicode character except control whitespace punctuation.
-- For texts and threads they are the colon character (:) followed by 15 random
-- bytes. In JSON they are represented by :<20-char base64>.

DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS rels CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS jobs;

CREATE TABLE users (
	id text PRIMARY KEY,
	name text, -- user display name
	identities text[], -- user-private
	createtime bigint,
	deletetime bigint,
	tags smallint[], -- e.g. admin, manager
	locale smallint,
	counts jsonb,
	params jsonb, -- user-private information
	presence smallint, -- foreground/background/none
	presencetime bigint,
	processid smallint,
	resources jsonb, -- { resourceId: foreground/background }
	timezone smallint,
	updatetime bigint
);

CREATE TABLE items (
	id uuid PRIMARY KEY,
	name text, -- room display name, thread title
	body text, -- room description, thread start message
	type smallint,
	parents uuid[], -- room or thread
	tags smallint[], -- e.g. image, hidden, sticky, city, area, spot
	createtime bigint,
	creator text,
	deletetime bigint,
	meta jsonb, -- guides, image dimensions, counts
	params jsonb,
	terms tsvector,
	updater text,
	updatetime bigint,
	counts jsonb
);

CREATE TABLE rooms (
	identities text[][],
	params jsonb -- owner-private information
) INHERITS (items);

CREATE TABLE threads (
	score float(24) -- sort ordering
) INHERITS (items);

CREATE TABLE texts  () INHERITS (items);
CREATE TABLE topics () INHERITS (items);
CREATE TABLE privs  () INHERITS (items);

CREATE TABLE rels (
	item uuid,
	"user" text,
	roles smallint[], -- mute, upvote, home, work
	roletime bigint,
	admin text,
	expiretime bigint,
	interest float(24),
	message text,
	presence smallint, -- writing/reading/none
	presencetime bigint,
	processid smallint,
	resources jsonb, -- { resource: writing/reading }
	transitrole smallint,
	transittype smallint,
	type smallint
);

CREATE TABLE roomrels   () INHERITS (rels);
CREATE TABLE threadrels () INHERITS (rels);
CREATE TABLE textrels   () INHERITS (rels);
CREATE TABLE topicrels  () INHERITS (rels);
CREATE TABLE privrels   () INHERITS (rels);

CREATE TABLE notes (
	"user" text,
	"group" text, -- e.g. thread in which mentioned, room to which invited
	score float(24),
	count integer, -- this event in this group id
	data jsonb, -- information like
	event smallint, -- e.g. mention, invite, request
	eventtime bigint
);

CREATE TABLE jobs (
	id smallint,
	lastrun bigint
);
