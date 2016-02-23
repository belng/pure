import { COLUMNS } from '../lib/schema';
import { Constants } from '../lib/Constants';

export default class Note {
	constructor(data) {
		for (const name of COLUMNS[Constants.TYPE_NOTE]) {
			this[name] = data[name] || data[name.toLowerCase()];
		}
	}

	packArguments() {
		const data = {};

		for (const name of COLUMNS[Constants.TYPE_NOTE]) {
			data[name] = this[name];
		}
		return [ data ];
	}

	getId() {
		return this.user + '_' + this.event + '_' + this.data.textId;
	}
}
