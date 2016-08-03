/* @flow */

import { Linking } from 'react-native';
import { takeLatest } from 'redux-saga';

export default function *openLinkSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('OPEN_LINK', action => {
		if (typeof action.payload === 'string') {
			Linking.openURL(action.payload);
		}
	});
}
