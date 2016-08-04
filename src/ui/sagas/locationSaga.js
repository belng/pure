/* @flow */

import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';

const { geolocation } = navigator;

let watch;

export default function *locationSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('INITIALIZE_STATE', function *() {
		geolocation.getCurrentPosition(position => put({
			type: 'SET_LOCATION',
			payload: position.coords,
		}));
		if (watch) {
			geolocation.clearWatch(watch);
		}
		watch = geolocation.watchPosition(position => put({
			type: 'SET_LOCATION',
			payload: position.coords,
		}));
	});
}
