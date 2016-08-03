/* @flow */

import { cache } from '../../core-client';
import type {
	QueryProvider,
	QueryProviderAPI,
} from './storeTypeDefinitions';
import type { SubscriptionOptions } from './cacheTypeDefinitions';

const LOADING = Object.freeze({ type: 'loading' });
const LOADING_ITEMS = Object.freeze([ LOADING ]);

const cacheQueryProvider : QueryProvider = ({ get, observe }: QueryProviderAPI) => {

	function getCache(options: any): ?Object {
		switch (options.type) {
		case 'entity':
			if (typeof options.id !== 'string') {
				throw new TypeError(`Invalid 'id' passed in ${options.source}`);
			}

			return cache.getEntity(options.id);
		default:
			return get(options);
		}
	}

	function observeCache(options: SubscriptionOptions): Observable<any> {
		switch (options.type) {
		case 'entity':
			if (typeof options.id !== 'string') {
				throw new TypeError(`Invalid 'id' passed in ${options.source}`);
			}

			return new Observable(observer => {
				return cache.watchEntity(options.id, data => {
					if (data && data.type === 'loading') {
						observer.next(LOADING);
					} else {
						observer.next(data || null);
					}
				});
			});
		case 'me': {
			return new Observable(observer => {
				let meSubscription;

				const userSubscription = observe({ type: 'state', path: 'user', source: 'cacheQueryProvider' }).subscribe({
					next: id => {
						if (meSubscription) {
							meSubscription.unsubscribe();
							meSubscription = null;
						}

						if (id) {
							meSubscription = observeCache({ type: 'entity', id, source: 'cacheQueryProvider' }).subscribe({
								next: user => {
									if (user && user.type === 'loading') {
										observer.next(LOADING);
									} else {
										observer.next(user || null);
									}
								},
							});
						}
					},
				});

				return () => {
					if (meSubscription) {
						meSubscription.unsubscribe();
					}
					userSubscription.unsubscribe();
				};
			});
		}
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
					throw new TypeError(`Range was not passed in ${options.source}`);
				}

				return new Observable(observer => {
					let unWatch, handle;

					const watchItems = () => {
						unWatch = cache.watch(options.slice, range, ({ arr }) => {
							if (arr.length === 1 && arr[0] && arr[0].type === 'loading') {
								observer.next(LOADING_ITEMS);
							} else {
								observer.next(arr.map(item => item.type === 'loading' ? LOADING : item));
							}
						});
					};

					if (options.defer) {
						observer.next(LOADING_ITEMS);

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
				});
			} else {
				throw new TypeError(`Invalid options passed in ${options.source}`);
			}
		default:
			return observe(options);
		}
	}

	return {
		get: getCache,
		observe: observeCache,
	};
};

export default cacheQueryProvider;
