/* @flow */

import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';
import getShortURLFromRoute from './helpers/getShortURLFromRoute';

export default function *shareTwitterSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('SHARE_TWITTER', function *(action) {
		const { text, url, route, hashtags } = action.payload;

		let link = 'http://twitter.com/intent/tweet?';

		if (text) {
			link += `text=${encodeURIComponent(text)}&`;
		}

		if (url) {
			link += `url=${encodeURIComponent(url)}&`;
		} else if (route) {
			const shortUrl = yield getShortURLFromRoute(route, 'twitter');
			link += `url=${encodeURIComponent(shortUrl || '')}&`;
		}

		if (hashtags) {
			link += `url=${encodeURIComponent(hashtags.join(','))}&`;
		}

		link += 'via=belongchat';

		yield put({
			type: 'OPEN_LINK',
			payload: link,
		});
	});
}
