/* @flow */

import type { Action } from '../../modules/store/storeTypeDefinitions';

export default function(state: string = '@@loading', action: Action) {
	switch (action.type) {
	case 'SET_SESSION':
		return action.payload;
	default:
		return state;
	}
}
