/* @flow */

import type { Action } from '../../lib/store/storeTypeDefinitions';

export default function(state: any = {}, action: Action) {
	switch (action.type) {
	case 'SET_STATE':
		return { ...state, ...action.payload };
	case 'CHANGE':
		if (action.payload && action.payload.state) {
			return { ...state, ...action.payload.state };
		}
		return state;
	default:
		return state;
	}
}
