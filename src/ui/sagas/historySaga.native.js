/* @flow */

import { Linking } from 'react-native';
import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';

export default function *historySaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('INITIALIZE_STATE', function *() {
		try {
			const initialURL = yield Linking.getInitialURL();
			yield put({
				type: 'SET_INITIAL_URL',
				payload: initialURL,
			});
		} catch (e) {
			yield put({
				type: 'SET_INITIAL_URL',
				payload: null,
			});
		}
	});
}
