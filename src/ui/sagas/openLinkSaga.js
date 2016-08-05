/* @flow */

import { takeLatest } from 'redux-saga';

export default function *openLinkSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('OPEN_LINK', action => {
		if (typeof action.payload === 'string') {
			window.location = action.payload;
		} else if (typeof action.payload === 'object') {
			const { url, target } = action.payload;
			if (target === '_blank') {
				window.open(url);
			} else {
				window.location = url;
			}
		}
	});
}
