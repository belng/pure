"use strict";
/*
Accepts entity changes, the cache and options, returns a stream of notify objects.
{ user, resource, censored_change, noteType, score }

Used by:
- store, to get userIds whose status is lower than "reading".
- socket, to get current server resourceIDs with status "online" or higher.
- push, to get users with push ids whose status is lower than "online"
- email, to get

Options include filtering by gateway (the prefix of the identity) and minimum score.
*/
var pg = require("./pg.js"),
	EventEmitter = require("events").EventEmitter;


function dispatch(changes, core, options) {
	let groups = {},
		stream = new EventEmitter();

	console.log(changes);
	for (let key in changes.entities) {
		
		if (!groups[changes.entities[key].parent[0]]) {
			groups[changes.entities[key].parent[0]] = {};
		}
		groups[changes.entities[key].parent][0][changes.entities[key].id] = changes.entities[key];
	}

	for (let parent in groups) {
		let change = {
			entities: groups[parent]
		};

		pg.readStream(pg.cat({
			$: "select * from relations where itemid =&{parent} ?",
			parent: parent
		})).on("row", function (rel) {
			stream.emit("data", change, rel);
		});
	}

	return stream;
}

module.exports = dispatch;

/*
What all triggers notify.
update/create of entities and relations.
so we will have to figure out which are the ones to send notification?
will this result in spliting setstate into multiple setstate? mostly it will be one.
*/
