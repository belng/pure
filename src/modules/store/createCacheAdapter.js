/* @flow */
/* eslint-disable consistent-return */

import promisify from '../../lib/promisify';
import type {
	Action,
	StoreAdapater,
} from '../../lib/store/storeTypeDefinitions';
import type {
	SubscriptionSlice,
	SubscriptionOptions
} from './subscriptionTypeDefinitions';

export type Cache = {
	watch: (slice: SubscriptionSlice, range: Array<?number>, callback: Function) => ?Function;
	watchEntity: (oid: string, callback: Function) => ?Function;
	getEntity: (oid: string, callback?: Function) => ?Object;
	put: (payload: any) => void;
}

const LOADING = Object.freeze({ type: 'loading' });
const LOADING_ITEMS = Object.freeze([ LOADING ]);

export default function createCacheAdapter(cache: Cache): StoreAdapater {

	const getEntityAsync = promisify(cache.getEntity);

	function dispatch(action: Action) {
		if (action.type === 'CHANGE') {
			cache.put(action.payload);
		}
	}

	function get(type: string, options: mixed) {
		if (type === 'entity') {
			return getEntityAsync(options);
		}
	}

	function getCurrent(type: string, options: string) {
		if (type === 'entity') {
			return cache.getEntity(options);
		}
	}

	function subscribe(path: string, options: SubscriptionOptions, callback: Function): ?Function {
		switch (path) {
		case 'entity':
			if (typeof options.id !== 'string') {
				throw new TypeError(`Invalid 'id' passed to cache#watchEntity in ${options.source}`);
			}

			return cache.watchEntity(options.id, data => {
				if (data && data.type === 'loading') {
					callback(LOADING);
				} else {
					callback(data || null);
				}
			});
		case 'list':
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
					throw new TypeError(`Range was not passed to cache#watch in ${options.source}`);
				}

				const slice = options.slice;
				let unWatch, handle;

				const watchItems = () => {
					unWatch = cache.watch(slice, range, ({ arr }) => {
						if (arr.length === 1 && arr[0] && arr[0].type === 'loading') {
							callback(LOADING_ITEMS);
						} else {
							callback(arr.map(item => item.type === 'loading' ? LOADING : item));
						}
					});
				};

				if (options.defer) {
					callback(LOADING_ITEMS);

					handle = global.requestIdleCallback(watchItems);
				} else {
					watchItems();
				}

				return () => {
					if (unWatch) {
						unWatch();
					}

					if (handle) {
						global.cancelIdleCallback(handle);
					}
				};
			} else {
				throw new TypeError(`Invalid options passed to store.observe in ${options.source}`);
			}
		}
	}

	return {
		get: get, // eslint-disable-line babel/object-shorthand
		getCurrent,
		subscribe,
		dispatch,
	};
}
