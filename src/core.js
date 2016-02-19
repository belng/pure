import defaults from '../config/server-defaults.json';
import jsonop from 'jsonop';
import { bus, cache, Constants } from './core-base';


export let config = jsonop({}, defaults);
console.log("server",config);
try {
	config = jsonop(config, require('../config/server.json'));
} catch (e) {
	// ignore
}

export {
	bus,
	cache,
	Constants
};
