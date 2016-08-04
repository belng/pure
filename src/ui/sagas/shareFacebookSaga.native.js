/* @flow */

import { ShareDialog } from 'react-native-fbsdk';
import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';
import getShortURLFromRoute from './helpers/getShortURLFromRoute';

export default function *shareTwitterSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('SHARE_FACEBOOK', function *(action) {
		const { image, text, url, route } = action.payload;

		let contentUrl;

		if (route) {
			contentUrl = yield getShortURLFromRoute(route, 'facebook');
		} else if (url) {
			contentUrl = url;
		}

		if (contentUrl) {
			const contentDescription = text;
			const imageURL = image;

			const shareLinkContent = {
				contentType: 'link',
				contentUrl,
				contentDescription,
				imageURL,
			};

			const canShow = yield ShareDialog.canShow(shareLinkContent);

			if (canShow) {
				ShareDialog.show(shareLinkContent);
			} else {
				yield put({
					type: 'OPEN_LINK',
					payload: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(contentUrl)}`,
				});
			}
		}
	});
}
