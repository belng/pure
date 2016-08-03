/* @flow */

import jsonop from 'jsonop';
import type { Action } from '../../modules/store/storeTypeDefinitions';

export default function(state: any = {}, action: Action) {
	switch (action.type) {
	case 'SET_STATE': {
		const changes = action.payload;
		const nextState = { ...state };

		for (const key in changes) {
			if (typeof nextState[key] === 'object' && nextState[key] !== null) {
				nextState[key] = jsonop.apply({ ...nextState[key] }, changes[key], {});
			} else {
				nextState[key] = changes[key];
			}
		}

		return nextState;
	}
	default:
		return state;
	}
}
