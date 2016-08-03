/* @flow */

import type { Action } from '../../modules/store/storeTypeDefinitions';

export default function(state: ?string = null, action: Action) {
	switch (action.type) {
	case 'SET_INITIAL_URL':
		return action.payload;
	default:
		return state;
	}
}
