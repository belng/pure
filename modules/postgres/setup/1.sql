-- entities ids are variable-length byte arrays.
-- For rooms and topics they are human-readable strings encoded with UTF-8.
-- They may contain any unicode character except control whitespace punctuation.
-- For texts and threads they are the colon character (:) followed by 15 random
-- bytes. In JSON they are represented by :<20-char base64>.

DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS relations CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
	id text PRIMARY KEY,
	tags smallint[], -- e.g. admin, manager
	name text, -- user display name
	identities text[], -- user-private
	timezone smallint,
	locale smallint,
	params jsonb, -- user-private information
	resources jsonb, -- { resourceId: foreground/background }
	presence smallint, -- foreground/background/none
	counts jsonb,
	createTime bigint,
	updateTime bigint,
	deleteTime bigint
);

CREATE TABLE items (
	id uuid PRIMARY KEY,
	name text, -- room display name, thread title
	body text, -- room description, thread start message
	tags smallint[], -- e.g. image, hidden, sticky, city, nbrhd, aptmt
	meta jsonb, -- guides, image dimensions, counts
	parents uuid[], -- room or thread
	creator text,
	updater text,
	terms tsvector,
	counts jsonb,
	createTime bigint,
	updateTime bigint,
	deleteTime bigint
);

CREATE TABLE rooms (
	params jsonb -- owner-private information
) INHERITS (items);

CREATE TABLE threads (
	score float(24) -- sort ordering
) INHERITS (items);

CREATE TABLE texts  () INHERITS (items);
CREATE TABLE topics () INHERITS (items);
CREATE TABLE privs  () INHERITS (items);

CREATE TABLE relations (
	"user" text,
	item uuid,
	tags smallint[], -- mute, upvote, home, work
	role smallint,
	roleTime bigint,
	interest float(24),
	reputation float(24),

	resources jsonb, -- { resource: writing/reading }
	presence smallint, -- writing/reading/none
	presenceTime bigint,

	message text,
	admin text,
	transitRole smallint,
	transitType smallint,
	expireTime bigint
);

CREATE TABLE roomrelations   () INHERITS (relations);
CREATE TABLE threadrelations () INHERITS (relations);
CREATE TABLE textrelations   () INHERITS (relations);
CREATE TABLE topicrelations  () INHERITS (relations);
CREATE TABLE privrelations   () INHERITS (relations);

CREATE TABLE notes (
	"user" text,
	event smallint, -- e.g. mention, invite, request
	"group" text, -- e.g. thread in which mentioned, room to which invited
	count integer, -- this event in this group id
	data jsonb -- information like
);
