/* @flow */

import '../socket/socket-client';
import '../store/storeHelpers';

if (process.env.NODE_ENV !== 'production') {
	require('../client-test/client-test');
}
