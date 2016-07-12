/* @flow */

import { bus } from '../../core-client';
import store from '../../modules/store/store';
import GoogleSignIn from '../../ui/modules/GoogleSignIn';
import Facebook from '../../ui/modules/Facebook';

bus.on('store:dispatch', action => {
	if (action.type === 'SIGN_OUT') {
		Facebook.logOut();
		GoogleSignIn.signOut();
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
