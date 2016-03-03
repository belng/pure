import { COLUMNS } from '../lib/schema';
import * as Constants from '../lib/Constants';

export default class User {
	constructor(data) {
		if (!data.type) { data.type = Constants.TYPE_USER; }
		if (data.type !== Constants.TYPE_USER) {
			throw (new Error('invalid_type'));
		}
		for (const name of COLUMNS[Constants.TYPE_USER]) {
			this[name] = data[name] || data[name.toLowerCase()];
		}
	}

	packArguments(): Object {
		const data = {};

		for (const name of COLUMNS[Constants.TYPE_USER]) {
			data[name] = this[name];
		}

		return [ data ];
	}

	hasIdentity(identity: string) {
		return this.identities.indexOf(identity) > -1 || false;
	}

	addIdentity(identity: string) {
		if (!this.hasIdentity(identity)) this.identities.push();
	}
}
