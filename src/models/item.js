import { COLUMNS, TYPES } from '../lib/schema';
import * as Constants from '../lib/Constants';

export default class Item {
	constructor(data) {
		if (!data) throw new Error('CANNOT_INITIALIZE_MODEL');

		this.type = data.type = data.type || 'item';
		for (const name of COLUMNS[TYPES[this.type]]) {
			this[name] = data[name] || data[name.toLowerCase()];
		}
	}

	packArguments(): Object {
		const data = {};

		for (const name of COLUMNS[Constants[TYPES[this.type]]]) {
			data[name] = this[name];
		}

		data.type = this.type;
		return [ data ];
	}

	hasIdentity(identity) {
		return (this.identities || []).indexOf(identity) >= 0;
	}

	addIdentity(identity) {
		if (!this.hadIdentity(identity)) this.identities.push();
	}

	isParent(parentId) {
		return (this.parentIds || [])[0] === parentId;
	}

	isAncestor(ancestorId) {
		return (this.parentId || []).indexOf(ancestorId) >= 0;
	}
}
