UPDATE users SET identities = '{}' WHERE identities IS NULL;
UPDATE users SET tags = '{}' WHERE tags IS NULL;
UPDATE items SET parents = '{}' WHERE parents IS NULL;
UPDATE rooms SET name = '' WHERE name IS NULL;
UPDATE threads SET name = '' WHERE name IS NULL;
UPDATE threads SET body = '' WHERE body IS NULL;
UPDATE texts SET body = '' WHERE body IS NULL;
UPDATE notes SET count = 1 WHERE count IS NULL;
UPDATE notes SET data = '{}' WHERE data IS NULL;
UPDATE items SET tags = '{}' WHERE tags IS NULL;
UPDATE items SET createtime = extract(epoch from now())*1000 WHERE createtime IS NULL;
UPDATE users SET createtime = extract(epoch from now())*1000 WHERE createtime IS NULL;

ALTER TABLE contacts ALTER COLUMN createtime SET NOT NULL;
ALTER TABLE contacts ALTER COLUMN createtime SET DEFAULT extract(epoch from now())*1000;

ALTER TABLE users ALTER COLUMN identities SET NOT NULL;
ALTER TABLE users ALTER COLUMN createtime SET NOT NULL;
ALTER TABLE users ALTER COLUMN tags SET NOT NULL;
ALTER TABLE users ALTER COLUMN createtime SET DEFAULT extract(epoch from now())*1000;
ALTER TABLE users ALTER COLUMN tags SET DEFAULT '{}';

ALTER TABLE items ALTER COLUMN parents SET NOT NULL;
ALTER TABLE items ALTER COLUMN createtime SET NOT NULL;
ALTER TABLE items ALTER COLUMN tags SET NOT NULL;
ALTER TABLE items ALTER COLUMN parents SET DEFAULT '{}';
ALTER TABLE items ALTER COLUMN createtime SET DEFAULT extract(epoch from now())*1000;
ALTER TABLE items ALTER COLUMN tags SET DEFAULT '{}';

ALTER TABLE rooms ALTER COLUMN name SET NOT NULL;
ALTER TABLE rooms ADD PRIMARY KEY (id);
ALTER TABLE threads ALTER COLUMN name SET NOT NULL;
ALTER TABLE threads ALTER COLUMN body SET NOT NULL;
ALTER TABLE threads ADD PRIMARY KEY (id);
ALTER TABLE texts ADD PRIMARY KEY (id);

ALTER TABLE texts ALTER COLUMN body SET NOT NULL;

ALTER TABLE rels ALTER COLUMN item SET NOT NULL;
ALTER TABLE rels ALTER COLUMN "user" SET NOT NULL;
ALTER TABLE rels ALTER COLUMN createtime SET NOT NULL;
ALTER TABLE rels ALTER COLUMN createtime SET DEFAULT extract(epoch from now())*1000;

ALTER TABLE notes ALTER COLUMN "group" SET NOT NULL;
ALTER TABLE notes ALTER COLUMN score SET NOT NULL;
ALTER TABLE notes ALTER COLUMN count SET NOT NULL;
ALTER TABLE notes ALTER COLUMN data SET NOT NULL;
ALTER TABLE notes ALTER COLUMN event SET NOT NULL;
ALTER TABLE notes ALTER COLUMN createtime SET NOT NULL;
ALTER TABLE notes ALTER COLUMN count SET DEFAULT 1;
ALTER TABLE notes ALTER COLUMN data SET DEFAULT '{}';
ALTER TABLE notes ALTER COLUMN createtime SET DEFAULT extract(epoch from now())*1000;

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

DROP OPERATOR CLASS IF EXISTS _uuid_ops USING gin;

CREATE OPERATOR CLASS _uuid_ops DEFAULT FOR TYPE _uuid USING gin AS
OPERATOR 1 &&(anyarray, anyarray),
OPERATOR 2 @>(anyarray, anyarray),
OPERATOR 3 <@(anyarray, anyarray),
OPERATOR 4 =(anyarray, anyarray),
FUNCTION 1 uuid_cmp(uuid, uuid),
FUNCTION 2 ginarrayextract(anyarray, internal, internal),
FUNCTION 3 ginqueryarrayextract(anyarray, internal, smallint, internal, internal, internal, internal),
FUNCTION 4 ginarrayconsistent(internal, smallint, anyarray, integer, internal, internal, internal, internal),
STORAGE uuid;

CREATE INDEX CONCURRENTLY ON texts USING GIN (parents);
CREATE INDEX CONCURRENTLY ON threads USING GIN (parents);
CREATE INDEX CONCURRENTLY ON texts (creator);
CREATE INDEX CONCURRENTLY ON threads (creator);
CREATE INDEX CONCURRENTLY ON threadrels USING GIN (roles);
CREATE INDEX CONCURRENTLY ON roomrels USING GIN (roles);
CREATE INDEX CONCURRENTLY ON threadrels (item);
CREATE INDEX CONCURRENTLY ON roomrels (item);
