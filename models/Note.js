"use strict";

module.exports = class Note {
	constructor(data) {
		for (const name of COLUMNS[data.type]) {
			this[name] = data[name] || data[name.toLowerCase()];
		}
	}

	packArguments() {
		const data = {};

		for (const name of COLUMNS[this.type]) {
			data[name] = this[name];
		}
		return data;
	}

	getId() {
		return this.note.user + "_" + this.note.event + "_" + this.note.data.textId;
	}
}