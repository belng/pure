/* @flow */

import { takeLatest } from 'redux-saga';
import GCM from '../modules/GCM';

function *dissmissNoteSaga() {
	yield* takeLatest('DISMISS_NOTE', action => {
		if (action.payload && action.payload.id) {
			GCM.deleteNotification(action.payload.id);
		}
	});
}

function *dismissAllSaga() {
	yield* takeLatest('DISMISS_ALL_NOTES', () => GCM.clearCurrentNotifications());
}

function *markAllAsReadSaga() {
	yield* takeLatest('MARK_ALL_NOTES_AS_READ', () => GCM.markCurrentNotificationsAsRead());
}

export default function *cacheSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield [
		dissmissNoteSaga(),
		dismissAllSaga(),
		markAllAsReadSaga(),
	];
}
