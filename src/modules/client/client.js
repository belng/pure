/* @flow */

import './client-base';

if (process.env.NODE_ENV !== 'production') {
	require('../client-test/client-test');
}
