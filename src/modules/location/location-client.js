/* @flow */

import { bus } from '../../core-client';
import store from '../../modules/store/store';

const BANGALORE = { latitude: 12.9667, longitude: 77.5667 };

bus.on('state:init', state => (state.location = BANGALORE));

const { geolocation } = navigator;

let watch, subscriptions = 0;

const success = position => store.dispatch({
	type: 'SET_STATE',
	payload: {
		location: position.coords,
	},
});

bus.on('store:subscribe', ({ path }) => {
	if (path === 'location') {
		geolocation.getCurrentPosition(success);

		if (subscriptions === 0) {
			watch = geolocation.watchPosition(success);
		}

		subscriptions++;
	}
});

bus.on('store:unsubscribe', ({ path }) => {
	if (path === 'location') {
		subscriptions--;

		if (subscriptions === 0 && watch) {
			geolocation.clearWatch(watch);
			watch = null;
		}
	}
});
