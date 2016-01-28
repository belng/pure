"use strict";

import Ebus from "ebus";
import SbCache from "sbcache";

export const Constants = require("./lib/constants.json");
export const bus = new Ebus();
export const cache = new SbCache({
	/* TODO: add is, id functions! */
	entityOp: { counts: { __all__: "inc" } }
});

bus.setDebug(5);
