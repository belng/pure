const constants = require("../../core").constants;
const types = {};

for(const type in constants.TYPES) {
	types[type] = require("./"+type);
}

modules.exports = types;