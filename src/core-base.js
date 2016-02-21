/* @flow */

import Ebus from 'ebus';
import SbCache from 'sbcache';

export * as Constants from './lib/Constants';

export type Bus = {
	on(event: string, callback: Function, priority?: number|string): void;
	off(event: string, callback: Function): void;
	emit(event: string, options: Object, callback?: Function): void;
	dump(event: string): void;
	setDebug(level: number): void;
}

export const bus: Bus = new Ebus();

export const cache = new SbCache({
	// TODO: add is, id functions!
	entityOp: { counts: { __all__: 'inc' } }
});
