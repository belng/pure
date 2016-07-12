/* @flow */

import type {
	Action,
	StoreAdapater,
} from '../../lib/store/storeTypeDefinitions';
import type {
	SubscriptionOptions
} from './subscriptionTypeDefinitions';

export default function createMiddlewaresAdapter(middlewares: Array<Function>): StoreAdapater {

	function subscribe(path: string, options: SubscriptionOptions): Function {
		for (const middleware of middlewares) {
			middleware({
				type: 'subscribe',
				payload: {
					path,
					options,
				}
			});
		}

		return () => {
			for (const middleware of middlewares) {
				middleware({
					type: 'unsubscribe',
					payload: {
						path,
						options,
					}
				});
			}
		};
	}

	function dispatch(action: Action) {
		console.trace(action.type, action.payload);
		for (const middleware of middlewares) {
			middleware({
				type: 'dispatch',
				payload: action,
			});
		}
	}

	return {
		subscribe,
		dispatch,
	};
}
