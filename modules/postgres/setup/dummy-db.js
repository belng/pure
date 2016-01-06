"use strict";

let pg = require("../../../lib/pg"),
	casual = require("casual"),
	uid = require('node-uuid'),
	constants = require("../../../lib/constants.json"),
	connstr = "pg://scrollback: @localhost/ptest", users = [], rooms = [], threads = [], texts = [],
	numUsers = 1000, numRooms = 500, numThreads = 20000, numTexts = 50000, numRoomRel = 5000, numThreadRel = 10000, numTextRel = 15000;
//116207038
function r(n) { 
	return Math.floor(Math.random() * n); 
}

function getId() {
	let u = casual.username.toLowerCase().replace(/\_|\./g, "-");
	if (users.indexOf(u) > -1) return u + "-" + users.length
	else return u
}


function insertUser(done) {
	let id = getId();
	users.push(id);
	pg.write(connstr, [{
		$: `INSERT INTO users (
			id, tags, name, identities, timezone, locale, createtime, updatetime 
		) VALUES (
			&{id}, ARRAY[&{tags}]::smallint[], &{name}, ARRAY[&{ident}]::text[], 330, 91,
			extract(epoch from now())*1000,
			extract(epoch from now())*1000
		)`,
		id: id,
		tags: constants.TAG_USER_EMAIL,
		name: casual.name,
		ident: casual.email.toLowerCase()
	}], done);	
}


function insertRoom(done) {
	let id = uid.v4(), room = casual.state;
	rooms.push(id);
	pg.write(connstr, [{
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
	}], done);
}

function insertThread(done) {
	let id = uid.v4();
	threads.push(id);
	pg.write(connstr, [{
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
		tags: Math.random() < 0.2 ? constants.TAG_POST_HIDDEN : constants.TAG_POST_STICKY,
		name: casual.sentence,
		body: casual.description,
		parents: rooms[Math.floor(Math.random() * rooms.length)],
		creator: users[Math.floor(Math.random() * users.length)],
		updater: users[Math.floor(Math.random() * users.length)]
	}], done);
}

function insertText(done) {
	let id = uid.v4();
	texts.push(id);
	pg.write(connstr, [{
		$: `INSERT INTO texts (
			id, tags, createtime, updatetime,
			body, parents, creator, updater
		) VALUES (
			&{id}, ARRAY[&{tags}]::smallint[],
			extract(epoch from now())*1000,
			extract(epoch from now())*1000,
			&{body}, ARRAY[&{parents}]::uuid[], &{creator}, &{updater}
		)`,
		id: id,
		tags: Math.random() < 0.3 ? constants.TAG_POST_HIDDEN : constants.TAG_POST_STICKY,
		body: casual.description,
		parents: threads[Math.floor(Math.random() * threads.length)],
		creator: users[Math.floor(Math.random() * users.length)],
		updater: users[Math.floor(Math.random() * users.length)]
	}], done);
}

function insertRoomrel(done) {
	pg.write(connstr, [{
		$: `INSERT INTO roomrelations (
			"user", item, role, roletime, interest
		) VALUES (
			&{user}, &{item}, &{role},
			extract(epoch from now())*1000, &{interest}
		)`,
		user: users[Math.floor(Math.random() * users.length)],
		item: rooms[Math.floor(Math.random() * rooms.length)],
		role: constants.ROLE_FOLLOWER,
		interest: Math.floor(Math.random() * 50)
	}], done);
}

function insertThreadrel(done) {
	pg.write(connstr, [{
		$: `INSERT INTO threadrelations (
			"user", item, role, roletime, interest
		) VALUES (
			&{user}, &{item}, &{role},
			extract(epoch from now())*1000, &{interest}
		)`,
		user: users[Math.floor(Math.random() * users.length)],
		item: threads[Math.floor(Math.random() * threads.length)],
		role: constants.ROLE_FOLLOWER,
		interest: Math.floor(Math.random() * 30)
	}], done);
}

function insertTextrel(done) {
	pg.write(connstr, [{
		$: `INSERT INTO textrelations (
			"user", item, role, roletime, interest
		) VALUES (
			&{user}, &{item}, &{role},
			extract(epoch from now())*1000, &{interest}
		)`,
		user: users[Math.floor(Math.random() * users.length)],
		item: threads[Math.floor(Math.random() * threads.length)],
		role: Math.random() < 0.5 ? constants.ROLE_FOLLOWER : constants.ROLE_MENTIONED,
		interest: Math.floor(Math.random() * 30)
	}], done);
}

function repeat(fn, times) {
	return new Promise(function (resolve, reject) {
		function next() {
			fn(function (err, result) {
				if (err) {
					return reject(err);
				}
				times--;
				if (times > 0) {
					next();	
				}
				else {
					resolve();
				}
			});
		}
		next();
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
	return repeat(insertRoomrel, numRoomRel);
}).then(function () {
	console.log("Done. Inserting watchers...");
	return repeat(insertThreadrel, numThreadRel);
}).then(function () {
	console.log("Done. Inserting presence...");
	return repeat(insertTextrel, numTextRel);
}).then(function () {
	console.log("All done...");
})
.catch(function (e) {
	console.log(e)
});
