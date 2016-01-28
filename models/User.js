/* @flow */

export default class User {
	constructor(data) {
		if (data.type !== "user") throw (new Error("invalid_type"));
		for (const name of COLUMNS["user"]) {
			this[name] = data[name] || data[name.toLowerCase()];
		}
	}

	packArguments() {
		const data = {};

		for (const name of COLUMNS["user"]) {
			data[name] = this[name];
		}
		return data;
	}

	hasIdentity(identity) {
		return (this.identities || []).indexOf(identity) >= 0;
	}

	addIdentity(identity) {
		if (!this.hadIdentity(identity)) this.identities.push();
	}
}
