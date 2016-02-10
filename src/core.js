/* @flow */

import Ebus from 'ebus';
import SbCache from 'sbcache';
import Constants from '../Constants/Constants.json';

type Bus = {
	on(event: string, callback: Function, priority?: number|string): void;
	off(event: string, callback: Function): void;
	emit(event: string, options: Object, callback?: Function): void;
	dump(event: string): void;
	setDebug(level: number): void;
}
const bus: Bus = new Ebus();
const cache = new SbCache({
	// TODO: add is, id functions!
	entityOp: { counts: { __all__: 'inc' } }
});
let config;
try {
	config = require('../config/server.json');
} catch (e) {
	config = require('../config/server-defaults.json');
}

bus.setDebug(5);

module.exports = {
	Constants,
	bus,
	config,
	cache
};
