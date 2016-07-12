/* @flow */
/* eslint-disable consistent-return */

import type {
	Action,
	StoreAdapater,
} from './storeTypeDefinitions';

type Reducer = (state: any, action: Action) => any;

export default function createGenericAdapter(rootReducer: Reducer, initialState: any): StoreAdapater {
	const listeners = {};
	let state = initialState;

	function dispatch(action: Action) {
		const oldState = state;
		state = rootReducer(state, action);
		for (const path in state) {
			if (oldState && state[path] === oldState[path]) {
				continue;
			}
			if (listeners[path]) {
				for (const listener of listeners[path]) {
					listener(state ? state[path] : null);
				}
			}
		}
	}

	function getCurrent(type: string) {
		if (state) {
			return state[type];
		}
	}

	function subscribe(path: string, options: any, callback: Function): Function {
		if (!listeners[path]) {
			listeners[path] = [];
		}
		listeners[path].push(callback);
		return () => {
			const index = listeners[path].indexOf(callback);
			listeners[path].splice(index, 1);
		};
	}

	return {
		get: getCurrent,
		getCurrent,
		subscribe,
		dispatch,
	};
}
