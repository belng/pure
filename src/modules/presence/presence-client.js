/* @flow */

import { bus } from '../../core-client';
import { subscribe, on } from '../store/store';
import { setPresence } from '../store/actions';

let subscription;

subscribe({ type: 'state', path: 'connectionStatus', source: 'presence' }, status => {
	if (status === 'online') {
		if (subscription) {
			subscription.remove();
		}

		subscription = subscribe({ type: 'state', path: 'user', source: 'presence' }, id => {
			if (id) {
				bus.emit('change', setPresence(id, 'online'));
				subscription.remove();
			}
		});
	}
});

on('subscribe', options => {
	if (options.slice) {
		const { slice } = options;

		switch (slice.type) {
		case 'thread':
			// TODO
			break;
		case 'text':
			// TODO
			break;
		case 'rel':
			if (slice.link === 'item') {
				// TODO
			}
			break;
		}
	}
});

on('unsubscribe', options => {
	if (options.slice) {
		const { slice } = options;

		switch (slice.type) {
		case 'thread':
			// TODO
			break;
		case 'text':
			// TODO
			break;
		case 'rel':
			if (slice.link === 'item') {
				// TODO
			}
			break;
		}
	}
});
