/* @flow */

import { takeLatest } from 'redux-saga';
import Share from '../modules/Share';
import getShortURLFromRoute from './helpers/getShortURLFromRoute';

export default function *shareLinkSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('SHARE_LINK', function *(action) {
		const { title, route, url, text } = action.payload;

		const parts: Array<string> = [];

		if (text) {
			parts.push(text);
		}

		if (url) {
			parts.push(url);
		} else if (route) {
			const shortUrl = yield getShortURLFromRoute(route, 'social');
			parts.push(shortUrl || '');
		}

		const shareText = parts.join('\n');

		Share.shareItem(title, shareText);
	});
}
