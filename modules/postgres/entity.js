"use strict";

const TYPE_TO_TABLE = {
	text: "texts",
	thread: "threads",
	room: "rooms",
	topic: "topics",
	note: "notes",
	user: "users",

}

module.exports = function (entity) {
	const parts = [{ $: "INSERT INTO " + TYPE_TO_TABLE[entity.type] }],
		colNames = [],
		colValues = {};

	for (const name in entity) {
		if (name === "id") {
			
		}
	}

	return query;
}
