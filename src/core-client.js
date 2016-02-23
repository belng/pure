/* @flow */

import defaults from '../config/client-defaults.json';

export * from './core-base';

export let config = { ...defaults };

try {
	config = Object.assign(config, require('../config/client.json'));
} catch (e) {
	// ignore
}
