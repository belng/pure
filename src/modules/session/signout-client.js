/* @flow */

import { bus } from '../../core-client';
import { signOut } from '../../modules/store/actions';

bus.on('signout', () => {
	bus.emit('change', signOut());
});
