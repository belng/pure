/* @flow */

import { bus } from '../../core-client';
import * as store from '../../modules/store/store';

const { geolocation } = navigator;

let watch, subscriptions = 0;

const success = position => bus.emit('change', { location: position.coords });
const error = () => {};
const options = {
	enableHighAccuracy: true,
	maximumAge: 0,
	timeout: Infinity
};

store.on('subscribe', ({ type }) => {
	if (type === 'location') {
		geolocation.getCurrentPosition(success, error, options);

		if (subscriptions === 0) {
			watch = geolocation.watchPosition(success, error, options);
		}

		subscriptions++;
	}
});

store.on('unsubscribe', ({ type }) => {
	if (type === 'location') {
		subscriptions--;

		if (subscriptions === 0 && watch) {
			geolocation.clearWatch(watch);
			watch = null;
		}
	}
});

bus.on('state:init', state => (state.location = '@@loading'));
