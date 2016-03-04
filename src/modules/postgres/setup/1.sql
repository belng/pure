-- psql -U user -h host -d database < /path/to/file.sql

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

CREATE EXTENSION plv8;

CREATE FUNCTION jsonop(oa jsonb, ob jsonb, oop jsonb) RETURNS jsonb AS $$
	if(typeof oa !== 'object') oa = JSON.parse(oa);
	if(typeof ob !== 'object') ob = JSON.parse(ob);
	if(typeof oop !== 'object') oop = JSON.parse(oop);

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	var el = { _: oa },
	    stack = [{ a: el, b: { _: ob }, op: { _: oop } }];

	var opfn = {
		keep: function keep(a) {
			return a;
		},
		inc: function inc(a, b, params) {
			return params && params[0] ? (a + b) % params[0] : a + b;
		},
		mul: function mul(a, b, params) {
			return params && params[0] ? a * b % params[0] : a * b;
		},
		min: function min(a, b) {
			return Math.min(a, b);
		},
		max: function max(a, b) {
			return Math.max(a, b);
		},
		mavg: function mavg(a, b, params) {
			return (a * (params[0] - 1) + b) / params[0];
		},
		union: function union(a, b, params) {
			var map = {};

			for (var _iterator = a, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
				var _ref;

				if (_isArray) {
					if (_i >= _iterator.length) break;
					_ref = _iterator[_i++];
				} else {
					_i = _iterator.next();
					if (_i.done) break;
					_ref = _i.value;
				}

				var i = _ref;
				map[i] = true;
			}
			for (var _iterator2 = params, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
				var _ref2;

				if (_isArray2) {
					if (_i2 >= _iterator2.length) break;
					_ref2 = _iterator2[_i2++];
				} else {
					_i2 = _iterator2.next();
					if (_i2.done) break;
					_ref2 = _i2.value;
				}

				var i = _ref2;
				delete map[i];
			}
			for (var _iterator3 = b, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
				var _ref3;

				if (_isArray3) {
					if (_i3 >= _iterator3.length) break;
					_ref3 = _iterator3[_i3++];
				} else {
					_i3 = _iterator3.next();
					if (_i3.done) break;
					_ref3 = _i3.value;
				}

				var i = _ref3;
				map[i] = true;
			}

			return Object.keys(map);
		},
		inter: function inter(a, b, params) {
			var map = {};

			for (var _iterator4 = b, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
				var _ref4;

				if (_isArray4) {
					if (_i4 >= _iterator4.length) break;
					_ref4 = _iterator4[_i4++];
				} else {
					_i4 = _iterator4.next();
					if (_i4.done) break;
					_ref4 = _i4.value;
				}

				var i = _ref4;
				if (i in a) {
					map[i] = true;
				}
			}
			for (var i in params) {
				map[i] = true;
			}

			return Object.keys(map);
		},
		splice: function splice(a, b, params) {
			if (params.length >= 2) {
				a.splice.apply(a, [params[0] === null ? Infinity : params[0], params[1]].concat(b));
			}
			if (params.length >= 4) {
				return a.slice(params[2] === null ? Infinity : params[2], params[3] === null ? Infinity : params[3]);
			} else {
				return a;
			}
		},
		replace: function replace(a, b) {
			return b;
		},
		append: function append(a, b, params) {
			return a + (params[0] || "") + b;
		},
		band: function band(a, b) {
			return a & b;
		},
		bor: function bor(a, b) {
			return a | b;
		},
		bxor: function bxor(a, b) {
			return a ^ b;
		},
		and: function and(a, b) {
			return a && b;
		},
		or: function or(a, b) {
			return a || b;
		},
		not: function not(a) {
			return !a;
		}
		// delete and merge are handled separately below
	};

	function deleteOps(obj) {
		var stack = [obj];

		do {
			var o = stack.pop();

			delete stack.__op__;
			for (var i in o) {
				if (_typeof(o[i]) === "object" && o[i] !== null) {
					stack.push(o[i]);
				}
			}
		} while (stack.length);
		return obj;
	}

	function opval(a, b, i, op, stack) {
		if (op === "delete" || op && op[0] === "delete") {
			delete a[i];
		} else if (op && (typeof op === "string" || Array.isArray(op)) && op !== "merge" && op[0] !== "merge") {
			if (Array.isArray(op)) {
				a[i] = deleteOps(opfn[op.shift()](a[i], b[i], op));
			} else {
				a[i] = deleteOps(opfn[op](a[i], b[i]));
			}
		} else if (Array.isArray(b[i]) && Array.isArray(a[i]) && (op === "merge" || op && op[0] === "merge")) {
			stack.push({ a: a[i], b: b[i] });
		} else if (Array.isArray(b) && b[i] === null) {
			// While merging arrays, skip nulls
		} else if (_typeof(b[i]) === "object" && _typeof(a[i]) === "object" && b[i] !== null && a[i] !== null && !Array.isArray(a[i]) && !Array.isArray(b[i])) {
				stack.push({ a: a[i], b: b[i], op: op });
			} else {
				a[i] = b[i];
			}
	}

	do {
		var frame = stack.pop(),
		    a = frame.a,
		    b = frame.b;
		var op = undefined,
		    map = undefined;

		if (frame.op && b.__op__) {
			op = jsonop(frame.op, b.__op__);
		} else {
			op = b.__op__ || frame.op;
		}
		map = op ? {} : b;

		if (op) {
			for (var i in b) {
				if (i !== "__op__") {
					map[i] = true;
				}
			}

			if (op.__all__) {
				for (var i in a) {
					map[i] = true;
				}
			} else {
				for (var i in op) {
					map[i] = true;
				}
			}
		}

		for (var i in map) {
			opval(a, b, i, op && (op[i] || op.__all__), stack);
		}
	} while (stack.length);

	return JSON.stringify(el._);
$$ LANGUAGE plv8 IMMUTABLE;
