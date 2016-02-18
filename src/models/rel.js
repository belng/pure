import { COLUMNS } from '../lib/schema';

export default class Relation {
	constructor(data) {
		for (const name of COLUMNS[data.type]) {
			this[name] = data[name] || data[name.toLowerCase()];
		}

		Object.defineProperty(this, 'id', { get: () => this.user + '_' + this.item });
	}

	packArguments() {
		const data = {};

		for (const name of COLUMNS[this.type]) {
			data[name] = this[name];
		}
		return data;
	}
}
