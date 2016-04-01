/* @flow */

import './polyfills/requestIdleCallback';

import '../gcm/gcm-client';
import '../history/history-client';
import '../location/location-client';
import '../presence/presence-client';
import '../session/session-client';
import '../session/signout-client';
import '../socket/socket-client';

import '../store/storeHelpers';
import '../store/stateManager';

if (process.env.NODE_ENV !== 'production') {
	require('../client-test/client-test');
}
