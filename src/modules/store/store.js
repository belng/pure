/* @flow */

import { bus, cache } from '../../core-client';
import type { SubscriptionOptions, Subscription } from './ConnectTypes';

export const subscribe = (options: SubscriptionOptions, callback: Function): Subscription => {
	let unWatch;

	switch (options.type) {
	case 'entity':
		unWatch = cache.watchEntity(options.id, callback);
		break;
	case 'state':
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
			unWatch = cache.watch(options.slice, options.range || [ -Infinity, Infinity ], results => callback(results.arr));
		} else {
			throw new Error('Invalid options passed to subscribe');
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
