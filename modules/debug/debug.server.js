/*
	Production process debug port.

	Also sets up winston transports such as CloudWatch and SNS.
*/

let winston = require("winston"),
	bus = require("../../bus");

winston.add(/* ... */);

bus.on("debug-level", (/* opts */) => {});
