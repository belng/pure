/* @flow */

import { compose, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import addQueryProviders from './addQueryProviders';
import cacheQueryProvider from './cacheQueryProvider';
import rootReducer from '../../ui/reducers/rootReducer';
import rootSaga from '../../ui/sagas/rootSaga';

const sagaMiddleware = createSagaMiddleware();
const middlewares = [ sagaMiddleware ];

const store = createStore(rootReducer, compose(
	applyMiddleware(...middlewares),
	addQueryProviders(cacheQueryProvider),
));

sagaMiddleware.run(rootSaga);

export default store;
