import defaults from '../config/client-defaults.json';
import clientConfig from '../config/client.json';
import { bus, cache, Constants } from './core-base';

export const config = Object.assign(Object.assign({}, defaults), clientConfig);
export {
	bus,
	cache,
	Constants
};
