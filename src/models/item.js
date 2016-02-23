import { COLUMNS } from '../lib/schema';
import { Constants } from '../lib/Constants';

export default class Item {
	constructor(data) {
		for (const name of COLUMNS[Constants.TYPE_ITEM]) {
			this[name] = data[name] || data[name.toLowerCase()];
		}
	}

	packArguments(): Object {
		const data = {};

		for (const name of COLUMNS[Constants.TYPE_ITEM]) {
			data[name] = this[name];
		}

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
