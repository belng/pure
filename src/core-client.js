/* @flow */

import defaults from '../config/client-defaults.json';
import custom from '../config/client.json';

export { bus, cache, Constants } from './core-base';

export const config = { ...defaults, ...custom };
