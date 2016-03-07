import { COLUMNS } from '../lib/schema';
import * as Constants from '../lib/Constants';

export default class User {
	constructor(data) {
		if (!data) { throw new Error('CANNOT_INITIALIZE_MODEL'); }
		if (!data.type) { data.type = Constants.TYPE_USER; }
		if (data.type !== Constants.TYPE_USER) {
			throw (new Error('INVALID_TYPE'));
		}

		console.trace(data);

		if (!data.id) { throw new Error('INVALID_USER_ID'); }

		for (const name of COLUMNS[Constants.TYPE_USER]) {
			if (typeof data[name.toLowerCase()] !== 'undefined' || typeof data[name] !== 'undefined') {
				this[name] = data[name] || data[name.toLowerCase()];
			}
		}

		if (data.error) this.error = data.error;
		if (data.create) this.create = data.create;
	}

	packArguments(): Object {
		const data = {};

		for (const name of COLUMNS[Constants.TYPE_USER]) {
			if (typeof this[name] !== 'undefined') {
				data[name] = this[name];
			}
		}

		data.type = this.type;
		if (this.error) data.error = this.error;
		if (this.create) data.create = this.create;
		return [ data ];
	}

	hasIdentity(identity: string) {
		return this.identities.indexOf(identity) > -1 || false;
	}

	addIdentity(identity: string) {
		if (!this.hasIdentity(identity)) this.identities.push();
	}
}
