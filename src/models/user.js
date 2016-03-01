import { COLUMNS } from '../lib/schema';
import * as Constants from '../lib/Constants';

export default class User {
	constructor(data) {
		if (!data) throw new Error('CANNOT_INITIALIZE_MODEL');
		if (!data.id) throw new Error('INVALID_USER_ID');

		for (const name of COLUMNS[Constants.TYPE_USER]) {
			this[name] = data[name] || data[name.toLowerCase()];
		}

		this.type = 'user';
	}

	packArguments(): Object {
		const data = {};

		for (const name of COLUMNS[Constants.TYPE_USER]) {
			data[name] = this[name];
		}

		data.type = this.type;
		return [ data ];
	}

	hasIdentity(identity: string) {
		return this.identities.indexOf(identity) > -1 || false;
	}

	addIdentity(identity: string) {
		if (!this.hasIdentity(identity)) this.identities.push();
	}
}
