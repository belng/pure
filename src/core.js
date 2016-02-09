/* @flow */

import jsonop from "jsonop";
import Ebus from "ebus";
import SbCache from "sbcache";
import Constants from "../Constants/Constants.json";

export { Constants };

type Bus = {
	on(event: string, callback: Function, priority?: number): void;
	off(event: string, callback: Function): void;
	emit(event: string, options: Object, callback?: Function): void;
	dump(event: string): void;
	setDebug(level: number): void;
}

export const bus: Bus = new Ebus();

bus.setDebug(5);

export const cache = new SbCache({
	/* TODO: add is, id functions! */
	entityOp: { counts: { __all__: "inc" } }
});

export let config;

try {
	config = jsonop({}, require("../config/server"));
} catch (e) {
	config = {};
}
