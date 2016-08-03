/* @flow */

import cacheSaga from './cacheSaga';
import ctaSaga from './ctaSaga';
import historySaga from './historySaga';
import locationSaga from './locationSaga';
import notesSaga from './notesSaga';
import openLinkSaga from './openLinkSaga';
import shareSaga from './shareSaga';
import signoutSaga from './signoutSaga';

export default function *rootSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield [
		cacheSaga(),
		ctaSaga(),
		historySaga(),
		locationSaga(),
		notesSaga(),
		openLinkSaga(),
		shareSaga(),
		signoutSaga(),
	];
}
