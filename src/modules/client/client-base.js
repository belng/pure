/* @flow */

import './polyfills/requestIdleCallback';

import '../store/stateManager';
import '../store/storeHelpers';

import '../gcm/gcm-client';
import '../history/history-client';
import '../location/location-client';
import '../presence/presence-client';
import '../session/session-client';
import '../socket/socket-client';

if (process.env.NODE_ENV !== 'production') {
	require('../client-test/client-test');
}
