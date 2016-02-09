import { Constants } from '../core';

const types = {};

for (const type in Constants.TYPES) {
	types[type] = require('./' + type);
}

export default types;
