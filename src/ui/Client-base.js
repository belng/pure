/* @flow */

import { bus, cache } from '../core-client';

import './polyfills/polyfills';

import '../modules/gcm/gcm-client';
import '../modules/presence/presence-client';
import '../modules/session/session-client';
import '../modules/socket/socket-client';
import '../modules/session/switcher-client';

import '../modules/store/stateManager';

if (process.env.NODE_ENV !== 'production') {
	window.cache = cache;
	window.bus = bus;
}
