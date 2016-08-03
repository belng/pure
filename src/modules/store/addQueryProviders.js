/* @flow */

import type {
	StoreCreator,
	Action,
	Reducer,
	State,
	QueryProvider,
} from './storeTypeDefinitions';

export default function addQueryProvider(...providers: Array<QueryProvider>) {
	return (createStore: StoreCreator) => (reducer: Reducer, preloadedState: State, enhancer: Function) => {
		/* eslint-disable no-use-before-define */
		const store = createStore(reducer, preloadedState, enhancer);
		const subscriptions = [];
		const allListeners = {};

		let providerAPI = {
			get: getPath,
			observe: observePath,
		};

		providers.forEach(provider => {
			providerAPI = provider(providerAPI);
		});

		function dispatch(action: Action) {
			const oldState = store.getState();
			store.dispatch(action);
			const currentState = store.getState();
			subscriptions.forEach(({ path, callback }) => {
				if (typeof oldState !== 'undefined' && typeof currentState !== 'undefined' && oldState[path] !== currentState[path]) {
					callback(currentState[path]);
				}
			});
		}

		function getPath(options: any): any {
			if (options.type === 'state') {
				const currentState = store.getState();
				if (typeof currentState === 'undefined') {
					return null;
				}
				return currentState[options.path];
			}

			return null;
		}

		function observePath(options: any): any {
			return new Observable(observer => {
				trigger('subscribe', options);
				if (options.type === 'state') {
					const callback = data => observer.next(data);
					const listener = { path: options.path, callback };
					subscriptions.push(listener);
					try {
						observer.next(providerAPI.get(options));
					} catch (e) {
						observer.error(e);
					}
					return () => {
						const index = subscriptions.indexOf(listener);
						if (index > -1) {
							subscriptions.splice(index, 1);
						}
						trigger('unsubscribe', options);
					};
				} else {
					observer.error(new Error('Invalid subscription'));
				}
				return () => {
					trigger('unsubscribe', options);
				};
			});
		}

		function on(event: string, cb: Function) {
			let listeners;

			if (allListeners[event]) {
				listeners = allListeners[event];
			} else {
				listeners = allListeners[event] = [];
			}

			listeners.push(cb);

			return {
				remove() {
					let index;

					for (let i = 0, l = listeners.length; i < l; i++) {
						if (listeners[i] !== cb) {
							continue;
						}

						index = i;
						break;
					}

					if (typeof index === 'number') {
						listeners.splice(index, 0);
					}
				}
			};
		}

		function trigger(event: string, payload?: any) {
			const listeners = allListeners[event];

			if (listeners) {
				listeners.forEach(cb => cb(payload));
			}
		}

		return {
			...store,
			...providerAPI,
			on,
			dispatch,
		};
	};
}
