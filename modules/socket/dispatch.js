"use strict";
import pg from './pg.js';
import {EventEmitter} from 'events';

function dispatch(changes, core, options) {
	let groups = {},
		stream = new EventEmitter();

	for (let key in changes.entities) {
		if (!groups[changes.entities[key].parent[0]]) {
			groups[changes.entities[key].parent[0]] = {};
		}
		groups[changes.entities[key].parent][0][changes.entities[key].id] = changes.entities[key];
	}

	for (let parent in groups) {
		let change = { entities: groups[parent] };
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
