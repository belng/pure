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
	counts jsonb,
	createtime bigint,
	deletetime bigint,
	id text PRIMARY KEY,
	identities text[], -- user-private
	locale smallint,
	name text, -- user display name
	params jsonb, -- user-private information
	presence smallint, -- foreground/background/none
	presencetime bigint,
	processid smallint,
	resources jsonb, -- { resourceId: foreground/background }
	tags smallint[], -- e.g. admin, manager
	timezone smallint,
	updatetime bigint
);

CREATE TABLE items (
	body text, -- room description, thread start message
	counts jsonb,
	createtime bigint,
	creator text,
	deletetime bigint,
	id uuid PRIMARY KEY,
	meta jsonb, -- guides, image dimensions, counts
	name text, -- room display name, thread title
	params jsonb,
	parents uuid[], -- room or thread
	tags smallint[], -- e.g. image, hidden, sticky, city, area, spot
	terms tsvector,
	type smallint,
	updater text,
	updatetime bigint
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
	admin text,
	expiretime bigint,
	interest float(24),
	item uuid,
	message text,
	presence smallint, -- writing/reading/none
	presencetime bigint,
	processid smallint,
	resources jsonb, -- { resource: writing/reading }
	roles smallint[], -- mute, upvote, home, work
	roletime bigint,
	transitrole smallint,
	transittype smallint,
	type smallint,
	"user" text
);

CREATE TABLE roomrels   () INHERITS (rels);
CREATE TABLE threadrels () INHERITS (rels);
CREATE TABLE textrels   () INHERITS (rels);
CREATE TABLE topicrels  () INHERITS (rels);
CREATE TABLE privrels   () INHERITS (rels);

CREATE TABLE notes (
	count integer, -- this event in this group id
	data jsonb, -- information like
	event smallint, -- e.g. mention, invite, request
	eventtime bigint,
	"group" text, -- e.g. thread in which mentioned, room to which invited
	score float(24),
	"user" text
);

CREATE TABLE jobs (
	id smallint,
	lastrun bigint
)
