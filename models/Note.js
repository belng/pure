"use strict";

module.exports = class Note {
	constructor (note) {
		this.note = note;
		this.getId = this.getid();
	}
	
	getid() {
		return this.note.user + "_" + this.note.event + "_" + this.note.data.textId;
	}
}