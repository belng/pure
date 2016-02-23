import { COLUMNS } from '../lib/schema';
import * as Constants from '../lib/Constants';

export default class Relation {
	constructor(data) {
		for (const name of COLUMNS[Constants.TYPE_REL]) {
			this[name] = data[name] || data[name.toLowerCase()];
		}

		Object.defineProperty(this, 'id', { get: () => this.user + '_' + this.item });
	}

	packArguments() {
		const data = {};

		for (const name of COLUMNS[Constants.TYPE_REL]) {
			data[name] = this[name];
		}
		return [ data ];
	}
}
