/* @flow */

import createStore from './createStore';
import cacheQueryProvider from './cacheQueryProvider';
import middlewares from '../../ui/middlewares/middlewares';

const store = createStore(rootReducer);

store.addQueryProvider(cacheQueryProvider);

middlewares.forEach(middleware =>
	store.addMiddleware(middleware)
);
