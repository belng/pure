/* @flow */

import jsonop from 'jsonop';
import Ebus from 'ebus';
import SbCache from 'sbcache';
import defaults from '../config/server-defaults.json';

export { default as Constants } from '../Constants/Constants.json';

export type Bus = {
	on(event: string, callback: Function, priority?: number|string): void;
	off(event: string, callback: Function): void;
	emit(event: string, options: Object, callback?: Function): void;
	dump(event: string): void;
	setDebug(level: number): void;
}

export const bus: Bus = new Ebus();

bus.setDebug(5);

export const cache = new SbCache({
	// TODO: add is, id functions!
	entityOp: { counts: { __all__: 'inc' } }
});

export let config = jsonop({}, defaults);

try {
	config = jsonop(config, require('../config/server.json'));
} catch (e) {
	// ignore
}
