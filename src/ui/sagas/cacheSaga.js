/* @flow */

import { takeEvery } from 'redux-saga';
import { bus } from '../../core-client';

function *changeSaga() {
	yield* takeEvery('CHANGE', action => bus.emit('change', action.payload));
}

function *authSaga() {
	yield* takeEvery('AUTH', action => bus.emit('change', { auth: action.payload }));
}

export default function *cacheSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield [
		changeSaga(),
		authSaga(),
	];
}
