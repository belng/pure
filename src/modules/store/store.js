/* @flow */

import { bus, cache } from '../../core-client';
import type { SubscriptionOptions, Subscription } from './ConnectTypes';

const LOADING = Object.freeze({ type: 'loading' });
const LOADING_ITEMS = Object.freeze([ LOADING ]);

export const subscribe = (options: SubscriptionOptions, callback: Function): Subscription => {
	let unWatch;

	switch (options.type) {
	case 'entity':
		callback(LOADING);

		if (typeof options.id !== 'string') {
			throw new TypeError(`Invalid 'id' passed to store.subscribe::entity in ${options.source}`);
		}

		unWatch = cache.watchEntity(options.id, callback);
		break;
	case 'state':
		if (typeof options.path !== 'string' && !Array.isArray(options.path)) {
			throw new TypeError(`Invalid 'path' passed to store.subscribe::state in ${options.source}`);
		}

		unWatch = cache.watchState(
			typeof options.path === 'string' ? [ options.path ] : options.path,
			data => callback(data && data.__op__ === 'delete' ? null : data)
		);
		break;
	case 'me':
		callback(LOADING);

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

			callback(LOADING_ITEMS);

			let handle;

			const unWatchInner = cache.watch(options.slice, range, results => (
				handle = global.requestIdleCallback(() => callback(results.arr)))
			);

			unWatch = () => {
				unWatchInner();

				if (handle) {
					global.cancelIdleCallback(handle);
				}
			};
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
