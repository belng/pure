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
	tags smallint[], -- e.g. admin, manager
	timezone smallint,
	locale smallint,
	params jsonb, -- user-private information
	resources jsonb, -- { resourceId: foreground/background }
	presence smallint, -- foreground/background/none
	processid smallint,
	presencetime bigint,
	counts jsonb,
	createtime bigint,
	updatetime bigint,
	deletetime bigint
);

CREATE TABLE items (
	id uuid PRIMARY KEY,
	name text, -- room display name, thread title
	body text, -- room description, thread start message
	type smallint,
	tags smallint[], -- e.g. image, hidden, sticky, city, area, spot
	meta jsonb, -- guides, image dimensions, counts
	parents uuid[], -- room or thread
	creator text,
	updater text,
	terms tsvector,
	counts jsonb,
	createtime bigint,
	updatetime bigint,
	deletetime bigint
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
	"user" text,
	item uuid,
	type smallint,
	roles smallint[], -- mute, upvote, home, work
	roletime bigint,
	interest float(24),

	resources jsonb, -- { resource: writing/reading }
	presence smallint, -- writing/reading/none
	presencetime bigint,
	processid smallint,

	message text,
	admin text,
	transitrole smallint,
	transittype smallint,
	expiretime bigint
);

CREATE TABLE roomrels   () INHERITS (rels);
CREATE TABLE threadrels () INHERITS (rels);
CREATE TABLE textrels   () INHERITS (rels);
CREATE TABLE topicrels  () INHERITS (rels);
CREATE TABLE privrels   () INHERITS (rels);

CREATE TABLE notes (
	"user" text,
	event smallint, -- e.g. mention, invite, request
	eventtime bigint,
	"group" text, -- e.g. thread in which mentioned, room to which invited
	count integer, -- this event in this group id
	score float(24),
	data jsonb -- information like
);

CREATE TABLE jobs (
	id smallint,
	lastrun bigint
)
