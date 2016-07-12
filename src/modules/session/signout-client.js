/* @flow */

import { bus } from '../../core-client';
import store from '../../modules/store/store';

bus.on('store:dispatch', action => {
	if (action.type === 'SIGN_OUT') {
		store.dispatch({
			type: 'SET_STATE',
			payload: {
				session: null,
				user: null,
				initialURL: null,
			},
		});
	}
});
