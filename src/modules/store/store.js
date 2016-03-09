/* @flow */

import { bus, cache } from '../../core-client';
import type { SubscriptionOptions, Subscription } from './ConnectTypes';

export const subscribe = (options: SubscriptionOptions, callback: Function): Subscription => {
	let unWatch;

	switch (options.type) {
	case 'entity':
		if (typeof options.id !== 'string') {
			throw new TypeError(`Invalid 'id' passed to store.subscribe::entity in ${options.source}`);
		}

		unWatch = cache.watchEntity(options.id, callback);
		break;
	case 'state':
		if (typeof options.path !== 'string' || !Array.isArray(options.path)) {
			throw new TypeError(`Invalid 'path' passed to store.subscribe::state in ${options.source}`);
		}

		unWatch = cache.watchState(typeof options.path === 'string' ? [ options.path ] : options.path, callback);
		break;
	case 'me':
		let unWatchMe;

		const unWatchUser = cache.watchState([ 'user' ], id => {
			if (unWatchMe) {
				unWatchMe();
			}

			unWatchMe = cache.watchEntity(id, callback);
		});

		unWatch = () => {
			if (unWatchMe) {
				unWatchMe();
			}

			unWatchUser();
		};

		break;
	default:
		if (options.slice) {
			let range;

			if (options.range) {
				const r = options.range;

				if ('before' in r || 'after' in r) {
					range = [ r.start, r.before || 0, r.after || 0 ];
				} else {
					range = [ r.start, r.end ];
				}
			} else {
				throw new TypeError(`Range was not passed to store.subscribe in ${options.source}`);
			}

			unWatch = cache.watch(options.slice, range, results => callback(results.arr));
		} else {
			throw new TypeError(`Invalid options passed to store.subscribe in ${options.source}`);
		}
	}

	bus.emit('store:subscribe', options);

	return {
		remove: () => {
			unWatch();

			bus.emit('store:unsubscribe', options);
		}
	};
};

export const off = (event: string, callback: Function): void => bus.off(`store:${event}`, callback);

export const on = (event: string, callback: Function): Subscription => {
	bus.on(`store:${event}`, callback);

	return {
		remove: () => off(event, callback)
	};
};

export const dispatch = (payload: Object): void => bus.emit('change', payload);
