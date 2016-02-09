"use strict";

import pg from "../../../lib/pg";
import casual from "casual";
import uid from "node-uuid";
import Constants from "../../../../Constants/Constants.json";

let connstr = "pg://hn:hn@localhost/hn", users = [], rooms = [], threads = [], texts = [], numUsers = 5, numRooms = 5, numThreads = 10, numTexts = 50;

function getId() {
	let u = casual.username.toLowerCase().replace(/\_|\./g, "-");
	if (users.indexOf(u) > -1) return u + "-" + users.length;
	else return u;
}

function insertUser(done) {
	let id = getId(), ident, tag, tags = [ Constants.TAG_USER_EMAIL, Constants.TAG_USER_GUEST, Constants.TAG_USER_FACEBOOK, Constants.TAG_USER_GOOGLE ];
	tag = tags[Math.floor(Math.random() * tags.length)];

	users.push(id);
	pg.write(connstr, [{
		$: `INSERT INTO users (
			id, tags, name, identities, timezone, locale, createtime, updatetime, presence 
		) VALUES (
			&{id}, ARRAY[&{tags}]::smallint[], &{name}, ARRAY[&{ident}]::text[], 330, 91,
			extract(epoch from now())*1000,
			extract(epoch from now())*1000, &{presence}
		)`,
		id: id,
		tags: tag,
		name: casual.name,
		ident: tag === Constants.TAG_USER_GUEST ? "guest" : "mailto:" + casual.email.toLowerCase(),
		presence: Math.random() <= 0.5 ? Constants.PRESENCE_FOREGROUND : Constants.PRESENCE_NONE
	}], done);	
}

function insertRoom(done) {
	let id = uid.v4(), room = casual.state;
	rooms.push(id);
	pg.write(connstr, [ {
		$: `INSERT INTO rooms (
			id, createtime, updatetime, name, body
		) VALUES (
			&{id}, extract(epoch from now())*1000,
			extract(epoch from now())*1000,
			&{room}, &{body}
		)`,
		id: id,
		room: room,
		body: casual.description
	} ], done);
}

function insertThread(done) {
	let id = uid.v4();
	threads.push(id);
	pg.write(connstr, [ {
		$: `INSERT INTO threads (
			id, tags, createtime, updatetime,
			name, body, parents, creator, updater
		) VALUES (
			&{id}, ARRAY[&{tags}]::smallint[],
			extract(epoch from now())*1000,
			extract(epoch from now())*1000,
			&{name}, &{body}, ARRAY[&{parents}]::uuid[], &{creator}, &{updater}
		)`,
		id: id,
		tags: Math.random() < 0.2 ? Constants.TAG_POST_HIDDEN : Constants.TAG_POST_STICKY,
		name: casual.sentence,
		body: casual.description,
		parents: rooms[Math.floor(Math.random() * rooms.length)],
		creator: users[Math.floor(Math.random() * users.length)],
		updater: users[Math.floor(Math.random() * users.length)]
	} ], done);
}

function insertText(done) {
	let id = uid.v4();
	texts.push(id);
	pg.write(connstr, [ {
		$: `INSERT INTO texts (
			id, tags, createtime, updatetime,
			body, parents, creator, updater
		) VALUES (
			&{id}, ARRAY[&{tags}]::smallint[],
			extract(epoch from now())*1000,
			extract(epoch from now())*1000,
			&{body}, ARRAY[&{thread}, &{room}]::uuid[], &{creator}, &{updater}
		)`,
		id: id,
		tags: Math.random() < 0.3 ? Constants.TAG_POST_HIDDEN : Constants.TAG_POST_STICKY,
		body: casual.description,
		thread: threads[Math.floor(Math.random() * threads.length)],
		room: rooms[Math.floor(Math.random() * rooms.length)],
		creator: users[Math.floor(Math.random() * users.length)],
		updater: users[Math.floor(Math.random() * users.length)]
	} ], done);
}

function insertRoomrel(usr, room, cb) {
	pg.write(connstr, [ {
		$: `INSERT INTO roomrels (
			"user", item, roles, roletime, interest
		) VALUES (
			&{user}, &{item}, ARRAY[&{role}]::smallint[],
			extract(epoch from now())*1000, &{interest}
		)`,
		user: usr,
		item: room,
		role: Constants.ROLE_FOLLOWER,
		interest: Math.floor(Math.random() * 50)
	} ], cb);
}

function insertThreadrel(usr, thread, cb) {
	let ptime = Math.random() < 0.4 ? Date.now() - 3 * 60 * 1000 : Date.now() + 60 * 1000;
	pg.write(connstr, [{
		$: `INSERT INTO threadrels (
			"user", item, roles, roletime, interest, presencetime
		) VALUES (
			&{user}, &{item}, ARRAY[&{role}]::smallint[],
			extract(epoch from now())*1000, &{interest}, &{ptime}
		)`,
		user: usr,
		item: thread,
		role: Constants.ROLE_FOLLOWER,
		interest: Math.floor(Math.random() * 30),
		ptime: ptime
	}], cb);
}

function insertTextrel(usr, text, cb) {
	pg.write(connstr, [ {
		$: `INSERT INTO textrels (
			"user", item, roles, roletime, interest
		) VALUES (
			&{user}, &{item}, ARRAY[&{role}]::smallint[],
			extract(epoch from now())*1000, &{interest}
		)`,
		user: usr,
		item: text,
		role: Math.random() < 0.5 ? Constants.ROLE_FOLLOWER : Constants.ROLE_MENTIONED,
		interest: Math.floor(Math.random() * 30)
	} ], cb);
}

function repeat(fn, repeatEl) {
	return new Promise(function (resolve, reject) {
		function next() {
			fn(function (err, result) {
				if (err) {
					return reject(err);
				}
				repeatEl--;
				if (repeatEl > 0) {
					next();
				}
				else {
					resolve();
				}
			});
		}

		if (typeof repeatEl === "number") {
			next();
		} else {
			Promise.all(users.map(usr => {
				const promises = [];

				for (let i = 0; i < Math.floor(Math.random() * repeatEl.length); i++) {
					promises.push(
						new Promise((resolve, reject) => {
							fn(usr, repeatEl[i], function(err, result) {
								if (err) {
									reject(err);
								} else {
									resolve(result);
								}
							});
						})
					);
				}

				return Promise.all(promises);
			}))
			.then(resolve)
			.catch(reject);
		}
	});
}


console.log("Inserting users...");
repeat(insertUser, numUsers)
.then(function () {
	console.log("Done. Inserting rooms...");
	return repeat(insertRoom, numRooms);
}).then(function () {
	console.log("Done. Inserting threads...");
	return repeat(insertThread, numThreads);
}).then(function () {
	console.log("Done. Inserting texts...");
	return repeat(insertText, numTexts);
}).then(function () {
	console.log("Done. Inserting room relations...");
	return repeat(insertRoomrel, rooms);
}).then(function () {
	console.log("Done. Inserting thread relations...");
	return repeat(insertThreadrel, threads);
}).then(function () {
	console.log("Done. Inserting text relations...");
	return repeat(insertTextrel, texts);
}).then(function () {
	console.log("All done...");
	process.exit();
})
.catch(function (e) {
	console.log(e)
	process.exit(1)
});
