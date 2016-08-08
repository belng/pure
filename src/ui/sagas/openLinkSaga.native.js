/* @flow */

import { Linking } from 'react-native';
import { takeLatest } from 'redux-saga';

async function openLink(url) {
	if (typeof url !== 'string' || /^#/.test(url)) {
		return;
	}
	const canOpen = await Linking.canOpenURL(url);
	if (canOpen) {
		await Linking.openURL(url);
	}
}

export default function *openLinkSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('OPEN_LINK', action => {
		if (typeof action.payload === 'string') {
			openLink(action.payload);
		} else if (typeof action.payload === 'object') {
			const { url } = action.payload;
			openLink(url);
		}
	});
}
