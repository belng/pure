/* @flow */

import type { Action } from '../../modules/store/storeTypeDefinitions';

export default function(state: string = 'connecting', action: Action) {
	switch (action.type) {
	case 'SET_CONNECTION_STATUS':
		return action.payload;
	default:
		return state;
	}
}
