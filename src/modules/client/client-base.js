/* @flow */

// $FlowFixMe: Flow cannot find ignored modules
import 'babel-polyfill';
import './polyfills/babelHelpers';
import './polyfills/requestIdleCallback';
import '../session/session-client';
import '../socket/socket-client';
import '../location/location-client';
import '../store/stateManager';
import '../store/storeHelpers';

if (process.env.NODE_ENV !== 'production') {
	require('../client-test/client-test');
}
