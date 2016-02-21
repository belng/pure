/* @flow */

import jsonop from 'jsonop';
import defaults from '../config/server-defaults.json';

export * from './core-base';

export let config = jsonop({}, defaults);

try {
	config = jsonop(config, require('../config/server.json'));
} catch (e) {
	// ignore
}
