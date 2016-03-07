/* @flow */

import './polyfills/requestIdleCallback';
// import '../presence/presence-client';
import '../session/session-client';
import '../socket/socket-client';
import '../location/location-client';
import '../store/stateManager';
import '../store/storeHelpers';

if (process.env.NODE_ENV !== 'production') {
	require('../client-test/client-test');
}
