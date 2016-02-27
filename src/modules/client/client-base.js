/* @flow */

// $FlowFixMe: Flow cannot find ignored modules
import 'babel-polyfill';
import '../store/stateManager';
import '../store/storeHelpers';
import '../socket/socket-client';

if (process.env.NODE_ENV !== 'production') {
	require('../client-test/client-test');
}
