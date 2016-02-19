import defaults from '../config/client-defaults.json';
import clientConfig from '../config/client.json';
export { bus as bus } from './core-base';
export { cache as cache } from './core-base';
export { Constants as Constants } from './lib/Constants';

export const config = Object.assign(Object.assign({}, defaults), clientConfig);
