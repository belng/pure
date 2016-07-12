/* @flow */

import type {
	Action,
	StoreAdapater,
} from './storeTypeDefinitions';

export default function createStore(adapters: Array<StoreAdapater>) {

	async function get(type: string, options?: mixed) {
		for (const adapter of adapters) {
			if (adapter.get) {
				const result = adapter.get(type, options);
				if (typeof result !== 'undefined') {
					return result;
				}
			}
		}
		return null;
	}

	function getCurrent(type: string, options?: mixed) {
		for (const adapter of adapters) {
			if (adapter.getCurrent) {
				const result = adapter.getCurrent(type, options);
				if (typeof result !== 'undefined') {
					return result;
				}
			}
		}
		return null;
	}

	function observe(type: string, options?: mixed) {
		return new Observable(observer => {
			const subscriptions = [];
			for (const adapter of adapters) {
				if (adapter.subscribe) {
					subscriptions.push(
						adapter.subscribe(type, options, result => {
							observer.next(result);
						})
					);
				}
			}
			return () => {
				for (const unsubscribe of subscriptions) {
					if (unsubscribe) {
						unsubscribe();
					}
				}
			};
		});
	}

	function dispatch(action: Action) {
		for (const adapter of adapters) {
			if (adapter.dispatch) {
				adapter.dispatch(action);
			}
		}
	}

	return {
		get: get, // eslint-disable-line babel/object-shorthand
		getCurrent,
		observe,
		dispatch,
	};
}
