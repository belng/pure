export default class User {
	identities: Array<string>;

	constructor(data) {
		if (data.type !== 'user') throw (new Error('invalid_type'));
		for (const name of COLUMNS['user']) {
			this[name] = data[name] || data[name.toLowerCase()];
		}
	}

	packArguments(): Object {
		const data = {};

		for (const name of COLUMNS['user']) {
			data[name] = this[name];
		}

		return data;
	}

	hasIdentity(identity: string) {
		return this.identities ? this.identities.indexOf(identity) > -1 : false;
	}

	addIdentity(identity: string) {
		if (!this.hasIdentity(identity)) this.identities.push();
	}
}
