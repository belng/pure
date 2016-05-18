-- psql -U user -h host -d database < /path/to/file.sql

-- entities ids are variable-length byte arrays.
-- For rooms and topics they are human-readable strings encoded with UTF-8.
-- They may contain any unicode character except control whitespace punctuation.
-- For texts and threads they are the colon character (:) followed by 15 random
-- bytes. In JSON they are represented by :<20-char base64>.

DROP TABLE IF EXISTS contacts;

CREATE TABLE contacts (
	referrer text,
	createtime bigint,
	contact jsonb
);

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
	counts jsonb default '{}',
	meta jsonb,
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
	counts jsonb default '{}'
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
	createtime bigint,
	updatetime bigint,
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
	type smallint,
	PRIMARY KEY("user","item")
);

CREATE TABLE roomrels   (PRIMARY KEY("user","item")) INHERITS (rels);
CREATE TABLE threadrels (PRIMARY KEY("user","item")) INHERITS (rels);
CREATE TABLE textrels   (PRIMARY KEY("user","item")) INHERITS (rels);
CREATE TABLE topicrels  (PRIMARY KEY("user","item")) INHERITS (rels);
CREATE TABLE privrels   (PRIMARY KEY("user","item")) INHERITS (rels);

CREATE TABLE notes (
	"user" text,
	"group" text, -- e.g. thread in which mentioned, room to which invited
	score float(24),
	count integer, -- this event in this group id
	data jsonb, -- information like
	event smallint, -- e.g. mention, invite, request
	createtime bigint,
	updatetime bigint,
	deletetime bigint
);

CREATE TABLE jobs (
	id smallint,
	lastrun bigint default extract(epoch from now())*1000
);
INSERT INTO jobs VALUES (1), (2), (3);
CREATE EXTENSION plv8;

INSERT INTO rooms (id, name) VALUES ('e8d0a3b8-6c00-4871-84ad-1078b1265c08', 'Support');


DROP FUNCTION IF EXISTS jsonop(jsonb, jsonb, jsonb);
DROP FUNCTION IF EXISTS jsonop(jsonb, jsonb);
CREATE FUNCTION jsonop(oa jsonb, ob jsonb) RETURNS jsonb AS $$
	function fn(left, right, doMerge) {

		var opfn;

		function isArray(arr) {
			return Object.prototype.toString.call(arr) === "[object Array]";
		}

		function updater(fn) {
			return function (a, b) {
				return typeof a === "undefined" ? deop(b) : fn(a, b);
			};
		}

		opfn = {
			$delete: function (a) { return; },
			$default: updater(function (a, b) { return a; }),
			$replace: function (a, b) { return deop(b); },

			$add: updater(function (a, b) { return a + b; }),
			$mul: updater(function (a, b) { return a * b; }),
			$min: updater(function (a, b) { return Math.min(a, b); }),
			$max: updater(function (a, b) { return Math.max(a, b); }),
			$mod: updater(function (a, b) { return a % b; }),

			$union: updater(function (a, b) {
				var result = a.slice(0), i = 0, l = b.length;
				for (; i < l; i++) if (a.indexOf(b[i]) === -1) result.push(b[i]);
				return result;
			}),
			$inter: updater(function (a, b) {
				var result = [], i = 0, l = b.length;
				for (; i < l; i++) if (a.indexOf(b[i]) >= 0) result.push(b[i]);
				return result;
			}),
			$remove: updater(function (a, b) {
				var pos = a.indexOf(b);
				if (pos >= 0) return a.slice(0, pos).concat(a.slice(pos + 1));
			}),

			$push: function (a, pos, b) {
				if (typeof a === "undefined") return;
				if (pos === null) return a.concat(deop(b));
				return a.slice(0, pos).concat(deop(b), a.slice(pos));
			},
			$chop: function (a, pos, num) {
				if (typeof a === "undefined") return [];
				if (pos === null) return a.slice(0, a.length + num);
				if (pos < 0) pos = a.length + pos;
				if (num < 0) { pos += num; num = -num; }
				if (pos < 0) { num += pos; pos = 0; }
				return a.slice(0, pos).concat(a.slice(pos + num));
			},

			$merge: updater(function (a, b) {
				var i = 0, l = b.length, r = a.slice(0);
				for (; i < l; i++) if (b[i] !== null) r[i] = jsonop(r[i], b[i]);
				return r;
			}),

			$append: updater(function (a, b) { return a + b; }),

			$and: updater(function (a, b) { return a && b; }),
			$or: updater(function (a, b) { return a || b; }),
			$not: function (a) { return !a; }
		};

		function isOperator(value) {
			return (typeof value === "string" && value[0] === "$");
		}

		function isOperation(value) {
			var i, l;
			if (isOperator(value)) return true;
			if (isArray(value)) {
				for (i = 0, l = value.length; i < l; i++) {
					if (isOperator(value[i])) return true;
				}
			}
			return false;
		}

		function execute(tokens) {
			var stack = [], i = 0, l = tokens.length, j, fn, args;
			for(; i < l; i++) if (isOperator(tokens[i])) {
				fn = opfn[tokens[i]]; args = [];
				if (typeof fn !== "function") throw Error("NoSuchOp " + tokens[i]);
				for (j = 0; j < fn.length; j++) args.unshift(stack.pop());
				stack.push(fn.apply(null, args));
			} else {
				stack.push(tokens[i]);
			}
			if (stack.length !== 1) throw Error("OpRun " + JSON.stringify(tokens));
			return stack[0];
		}

		function merge(left, right) {
			var i, result = {}, res;
			for (i in left) result[i] = left[i];
			for (i in right) {
				res = jsonop(result[i], right[i]);
				if (typeof res === "undefined") {
					delete result[i];
				} else {
					result[i] = res;
				}
			}
			return result;
		}

		function deop(object) {
			var i, j, clone = object, cloned = false, val;

			if (doMerge) return object;
			if (isOperation(object)) return execute([ undefined ].concat(object));
			if (typeof object !== "object" || object === null) return object;

			for (i in object) {
				val = deop(object[i]);
				if (val !== object[i]) {
					if (!cloned) {
						clone = Array.isArray(object) ? [] : {};
						for (j in object) {
							if (j === i) break;
							clone[j] = object[j];
						}
						cloned = true;
					}
				}
				if (cloned) clone[i] = val;
			}

			return clone;
		}

		function jsonop(left, right) {
			if (isOperation(right)) {
				right = isArray(right) ? right : [ right ];
				if (isOperation(left)) {
					left = isArray(left) ? left : [ left ];
					if (doMerge) return left.concat(right);
					return execute([ undefined ].concat(left, right));
				}

				if (doMerge && typeof left === "undefined") return right;
				return execute([ left ].concat(right));
			}

			if (typeof left === "object" && left !== null && !isArray(left)) {
				if (typeof right === "object" && right !== null && !isArray(right)){
					return merge(left, right);
				}
			}

			return typeof right !== "undefined" ? deop(right) : left;
		}

		return jsonop(left, right);
	}
	if (typeof oa !== 'object') oa = JSON.parse(oa);
	if (typeof ob !== 'object') ob = JSON.parse(ob);

	return JSON.stringify(fn(oa, ob, oop));
$$ LANGUAGE plv8 IMMUTABLE;
