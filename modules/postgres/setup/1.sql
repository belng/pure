-- entities ids are variable-length byte arrays.
-- For rooms and topics they are human-readable strings encoded with UTF-8.
-- They may contain any unicode character except control whitespace punctuation.
-- For texts and threads they are the colon character (:) followed by 15 random
-- bytes. In JSON they are represented by :<20-char base64>.

DROP TABLE IF EXISTS notes;

DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS watchers;
DROP TABLE IF EXISTS presence;
DROP TABLE IF EXISTS transits;
DROP TABLE IF EXISTS relations;

DROP TABLE IF EXISTS roots;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS entities;

CREATE TABLE entities (
	id text PRIMARY KEY,
	type smallint,
	tags smallint[],
	createTime bigint,
	updateTime bigint,
	deleteTime bigint
);

CREATE TABLE users (
	identities text[],
	timezone smallint,
	locale smallint,
	params jsonb,
	numVotes  integer,
	numPoints integer
) INHERITS (entities);

CREATE TABLE items (
	name text, -- room display name, thread title
	body text, -- room description, thread start message
	meta jsonb, -- guides, image dimensions, counts
	parents text[], -- room or thread
	creator text,
	updater text,
	terms tsvector
) INHERITS (entities);

CREATE TABLE rooms (
	params jsonb -- owner-private information
) INHERITS (items);

CREATE TABLE threads (
	topics text[]
) INHERITS (items);

CREATE TABLE texts (
	room text
) INHERITS (items);

CREATE TABLE topics (
	room text
) INHERITS (items);

CREATE TABLE privchat () INHERITS (items);

CREATE TABLE relations (
	"user" text, -- may be id or identity
	item text,
	tags smallint[],
	role smallint,
	roleTime bigint,
	readTime bigint,
	interest float(24),
	reputation float(24),
	resource text,
	message text,
	admin text,
	transitRole smallint,
	transitType smallint,
	createTime bigint,
	expireTime bigint
);

CREATE TABLE roomrelations () EXTENDS relations;
CREATE TABLE threadrelations () EXTENDS relations;
CREATE TABLE textrelations () EXTENDS relations;
CREATE TABLE topicrelations () EXTENDS relations;
CREATE TABLE privchatrelations () EXTENDS relations;

CREATE TABLE notes (
	"user" text,
	entities text,
	event smallint,
	data jsonb
) INHERITS (entities);
