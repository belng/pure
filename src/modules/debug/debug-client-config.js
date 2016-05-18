/* @flow */

import jsonop from 'jsonop';
import defaults from '../../../config/debug-client-defaults.json';

let config = jsonop.apply({}, defaults);

try {
	config = jsonop.apply(config, require('../../../config/debug-client.json'));
} catch (e) {
	// ignore
}
export default config;
