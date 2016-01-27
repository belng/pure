"use strict";
let bus = new (require("ebus"))();
exports.constants = require("./lib/constants.json");
exports.bus = new (require("ebus"))();
exports.cache = new (require("sbcache"))({
	/* TODO: add is, id functions! */
	entityOp: { counts: { __all__: "inc" } }
});

exports.bus.setDebug(5);
