/*
	for singletons.
		* bus
		* cache
		* log
		* config		
*/

var bus = new (require("ebus"))(),
	cache = new (require("sbcache")());

module.exports = {
	bus: bus,
	config: {},
	cache: cache
};