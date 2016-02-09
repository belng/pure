import { COLUMNS } from '../lib/schema';

export default class Note {
	constructor(data) {
		for (const name of COLUMNS[data.type]) {
			this[name] = data[name] || data[name.toLowerCase()];
		}
	}

	packArguments() {
		const data = {};

		for (const name of COLUMNS[this.type]) {
			data[name] = this[name];
		}
		return data;
	}

	getId() {
		return this.user + '_' + this.event + '_' + this.data.textId;
	}
}
