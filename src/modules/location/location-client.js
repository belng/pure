/* @flow */

import { bus } from '../../core-client';
import * as store from '../../modules/store/store';

const { geolocation } = navigator;

let watch, subscriptions = 0;

const success = position => bus.emit('change', {
	state: {
		location: position.coords
	}
});

store.on('subscribe', ({ path }) => {
	if (path === 'location') {
		geolocation.getCurrentPosition(success);

		if (subscriptions === 0) {
			watch = geolocation.watchPosition(success);
		}

		subscriptions++;
	}
});

store.on('unsubscribe', ({ path }) => {
	if (path === 'location') {
		subscriptions--;

		if (subscriptions === 0 && watch) {
			geolocation.clearWatch(watch);
			watch = null;
		}
	}
});
