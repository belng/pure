/* @flow */

import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';
import getShortURLFromRoute from './helpers/getShortURLFromRoute';

export default function *shareWhatsAppSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('SHARE_WHATSAPP', function *(action) {
		const { text, url, route } = action.payload;

		const parts = [];

		if (text) {
			parts.push(text);
		}

		if (url) {
			parts.push(url);
		} else if (route) {
			const shortUrl = yield getShortURLFromRoute(route, 'whatsapp');
			parts.push(shortUrl);
		}

		const shareText = parts.join('\n');

		yield put({
			type: 'OPEN_LINK',
			payload: `whatsapp://send?text=${encodeURIComponent(shareText)}`,
		});
	});
}
