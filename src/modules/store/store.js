/* @flow */

import forEach from 'lodash/forEach';
import pull from 'lodash/pull';
import { bus, cache } from '../../core-client';
import type { SubscriptionOptions, Subscription } from './ConnectTypes';

const _subscriptionWatches = [];
const _unsubscriptionWatches = [];

export const subscribe = (options: SubscriptionOptions, callback: Function): Subscription => {
	let unWatch;

	switch (options.what) {
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
			unWatch = cache.watch(options.slice, options.range || {}, callback);
		} else {
			throw new Error('Invalid options passed to subscribe');
		}
	}

	forEach(_subscriptionWatches, fn => fn(options));

	return {
		remove: () => {
			unWatch();

			forEach(_unsubscriptionWatches, fn => fn(options));
		}
	};
};

export const onSubscribe = (callback: Function): Subscription => {
	const watches = _subscriptionWatches;

	watches.push(callback);

	return {
		remove: () => { pull(watches, callback); }
	};
};

export const onUnsubscribe = (callback: Function): Subscription => {
	const watches = _unsubscriptionWatches;

	watches.push(callback);

	return {
		remove: () => { pull(watches, callback); }
	};
};

export const setState = (payload: Object): void => bus.emit('change', payload);
