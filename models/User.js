"use strict";
module.exports = class User {
	constructor() {}
	loadFromStringPack() {

	}

	hasIdentity(identity) {
		return (this.identities || []).indexOf(identity) >= 0;
	}

	addIdentity(identity) {
		if (!this.hadIdentity(identity)) this.identities.push();
	}
};
