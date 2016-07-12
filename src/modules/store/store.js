/* @flow */

import createStore from '../../lib/store/createStore';
import createGenericAdapter from '../../lib/store/createGenericAdapter';
import createCacheAdapter from './createCacheAdapter';
import createMiddlewaresAdapter from './createMiddlewaresAdapter';
import rootReducer from './rootReducer';
import { bus, cache } from '../../core-client';

const adapters = [
	createMiddlewaresAdapter([
		({ type, payload }) => bus.emit(`store:${type}`, payload),
	]),
	createGenericAdapter(rootReducer),
	createCacheAdapter(cache),
];
const store = createStore(adapters);

export default store;
