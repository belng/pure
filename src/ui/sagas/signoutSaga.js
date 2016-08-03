/* @flow */

import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';
import { bus } from '../../core-client';
import { resetSession } from '../../modules/store/actions';

export default function *locationSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('SIGNOUT', function *() {
		bus.emit('signout'); // FIXME: temporary
		yield put(resetSession());
	});
}
