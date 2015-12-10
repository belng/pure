/*

	for singletons.
		* bus
		* cache
		* log
		* config
		
*/

var bus = new (require("ebus"))(),
	cache = require("./modules/store/store.js");

module.exports = {
	bus: bus,
	config: {},
	cache: cache
};