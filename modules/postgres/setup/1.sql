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
	meta jsonb, -- guides, image dimensions
	parent text, -- room or thread
	creator text,
	updater text,
	terms tsvector,
	numMembers integer,
	numPresent integer,
	numChildren integer,
	numUpvotes integer,
	numFlags integer,
	score float(24)
) INHERITS (entities);

CREATE TABLE roots (
	params jsonb -- owner-private information
) INHERITS (items);

CREATE TABLE posts (
	room text,
	topics text[]
) INHERITS (items);

CREATE TABLE relations (
	"user" text, -- not FK; may be id or identity
	item text,
	tags smallint[],
	role smallint,
	status smallint,
	roleTime bigint,
	statusTime bigint,
	interest float(24),
	reputation float(24)
);

CREATE TABLE members () INHERITS (relations);
CREATE TABLE watchers () INHERITS (relations);
CREATE TABLE presence (
	resource text
) INHERITS (relations);

CREATE TABLE transits (
	message text,
	admin text,
	transitRole smallint,
	transitType smallint,
	createTime bigint,
	expireTime bigint
) INHERITS (relations);

CREATE TABLE notes (
	"user" text,
	entities text,
	event smallint,
	data jsonb
);
