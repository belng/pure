"use strict";
let bus = new (require("ebus"))();
exports.cache = new (require("sbcache"))();
bus.setDebug(5);
exports.bus = bus;
exports.constants = require("./lib/constants.json");