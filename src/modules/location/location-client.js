/* @flow */

import { bus } from '../../core-client';
import { on } from '../store/store';

const BANGALORE = { latitude: 12.9667, longitude: 77.5667 };

bus.on('state:init', state => (state.location = BANGALORE));

const { geolocation } = navigator;

let watch, subscriptions = 0;

const success = position => bus.emit('change', {
	state: {
		location: position.coords
	}
});

on('subscribe', ({ path }) => {
	if (path === 'location') {
		geolocation.getCurrentPosition(success);

		if (subscriptions === 0) {
			watch = geolocation.watchPosition(success);
		}

		subscriptions++;
	}
});

on('unsubscribe', ({ path }) => {
	if (path === 'location') {
		subscriptions--;

		if (subscriptions === 0 && watch) {
			geolocation.clearWatch(watch);
			watch = null;
		}
	}
});
