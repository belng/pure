"use strict";
module.exports = class Room {
	constructor() {}
	loadFromStringPack() {

	}

	hasIdentity(identity) {
		return (this.identities || []).indexOf(identity) >= 0;
	}

	isParent(parentId) {
		return (this.parentIds || [])[0] === parentId;
	}

	isAncestor(ancestorId) {
		return (this.parentId || []).indexOf(ancestorId) >= 0;
	}
};
