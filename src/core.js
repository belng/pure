import defaults from '../config/server-defaults.json';
import jsonop from 'jsonop';

export { bus as bus } from './core-base';
export { cache as cache } from './core-base';
export { Constants as Constants } from './lib/Constants';
export let config = jsonop({}, defaults);

try {
	config = jsonop(config, require('../config/server.json'));
} catch (e) {
	// ignore
}
