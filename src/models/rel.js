import { COLUMNS } from '../lib/schema';

export default class Relation {
	constructor(data) {
		if (!data) throw new Error('CANNOT_INITIALIZE_MODEL');

		for (const name of COLUMNS[data.type]) {
			if (typeof data[name] !== 'undefined') {
				this[name] = data[name] || data[name.toLowerCase()];
			}
		}

		if (data.error) this.error = data.error;
		if (data.create) this.create = data.create;

		Object.defineProperty(this, 'id', {
			get: () => this.user + '_' + this.item,
			enumerable: false
		});
	}

	packArguments() {
		const data = {};

		for (const name of COLUMNS[this.type]) {
			if (typeof data[name] !== 'undefined') {
				data[name] = this[name];
			}
		}

		data.type = this.type;
		if (this.error) data.error = this.error;
		if (this.create) data.create = this.create;
		return [ data ];
	}
}
