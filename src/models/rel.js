import { COLUMNS } from '../lib/schema';
import * as Constants from '../lib/Constants';

export default class Relation {
	constructor(data) {
		if (!data) throw new Error('CANNOT_INITIALIZE_MODEL');
		if (!data.user) throw new Error('INVALID_USER_ID');

		for (const name of COLUMNS[Constants.TYPE_REL]) {
			this[name] = data[name] || data[name.toLowerCase()];
		}

		if (data.error) this.error = data.error;

		Object.defineProperty(this, 'id', { get: () => this.user + '_' + this.item });
	}

	packArguments() {
		const data = {};

		for (const name of COLUMNS[Constants.TYPE_REL]) {
			data[name] = this[name];
		}

		data.type = this.type;
		if (this.error) data.error = this.error;
		return [ data ];
	}
}
