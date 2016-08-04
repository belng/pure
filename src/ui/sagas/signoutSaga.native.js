/* @flow */

import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';
import { LoginManager } from 'react-native-fbsdk';
import GoogleSignIn from '../../ui/modules/GoogleSignIn';
import { bus } from '../../core-client';
import { resetSession } from '../../modules/store/actions';

export default function *locationSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('SIGNOUT', function *() {
		bus.emit('signout'); // FIXME: temporary
		LoginManager.logOut();
		GoogleSignIn.signOut();
		yield put(resetSession());
	});
}
