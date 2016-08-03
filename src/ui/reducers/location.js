/* @flow */

import type { Action } from '../../modules/store/storeTypeDefinitions';

const BANGALORE = { latitude: 12.9667, longitude: 77.5667 };

export default function(state: Object = BANGALORE, action: Action) {
	switch (action.type) {
	case 'SET_LOCATION':
		return action.payload;
	default:
		return state;
	}
}
