/* @flow */

import { bus } from '../../core-client';
import { signOut } from '../../modules/store/actions';
import GoogleSignIn from '../../ui/modules/GoogleSignIn';
import Facebook from '../../ui/modules/Facebook';

bus.on('signout', () => {
	bus.emit('change', signOut());
	Facebook.logOut();
	GoogleSignIn.signOut();
});
