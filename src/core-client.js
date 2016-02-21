/* @flow */

import defaults from '../config/client-defaults.json';
import custom from '../config/client.json';

export * from './core-base';

export const config = { ...defaults, ...custom };
