/* @flow */

import jsonop from 'jsonop';
import defaults from '../config/server-defaults.json';

export * from './core-base';

export let config = jsonop.apply({}, defaults);

try {
	config = jsonop.apply(config, require('../config/server.json'));
} catch (e) {
	// ignore
}
