/* @flow */

import forEach from 'lodash/forEach';
import pull from 'lodash/pull';
import { bus, cache } from '../../core-client';
import type { SubscriptionSlice, SubscriptionRange, Subscription } from './ConnectTypes';

const _subscriptionWatches = [];
const _unsubscriptionWatches = [];

export const subscribe = (options: {
	what?: string;
	slice?: SubscriptionSlice;
	range?: SubscriptionRange;
	order?: string;
	id?: string;
	path?: string|Array<string>
}, callback: Function): Subscription => {
	let watch;

	switch (options.what) {
	case 'entity':
		watch = cache.watchEntity(options.id, callback);
		break;
	case 'texts':
	case 'threads':
		watch = cache.watch(options.slice, options.range, callback);
		break;
	case 'app':
		watch = cache.watchApp(typeof options.path === 'string' ? [ options.path ] : options.path, callback);
		break;
	case 'me':
		let meWatch;

		const userWatch = cache.watchApp([ 'user' ], id => {
			if (meWatch) {
				meWatch.remove();
			}

			meWatch = cache.watchEntity(id, callback);
		});

		watch = {
			remove: () => {
				if (meWatch) {
					meWatch.remove();
				}

				userWatch.remove();
			}
		};

		break;
	default:
		throw new Error('Invalid options passed to subscribe');
	}

	forEach(_subscriptionWatches, fn => fn(options));

	return {
		remove: () => {
			watch.remove();

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

export const setState = (payload: Object): void => bus.emit('setstate', payload);
