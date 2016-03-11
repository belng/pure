/* @flow */

import { bus } from '../../core-client';
import { subscribe, on } from '../store/store';
import { setPresence, setItemPresence } from '../store/actions';

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

		subscription = subscribe({ type: 'state', path: 'user', source: 'presence' }, id => {
			if (id) {
				switch (slice.type) {
				case 'thread':
					bus.emit('change', setItemPresence('room', slice.filter.parents_cts[0], id, 'online'));
					break;
				case 'text':
					bus.emit('change', setItemPresence('thread', slice.filter.parents_cts[0], id, 'online'));
					break;
				}
				subscription.remove();
			}
		});
	}
});

on('unsubscribe', options => {
	if (options.slice) {
		const { slice } = options;

		subscription = subscribe({ type: 'state', path: 'user', source: 'presence' }, id => {
			if (id) {
				switch (slice.type) {
				case 'thread':
					bus.emit('change', setItemPresence('room', slice.filter.parents_cts[0], id, 'offline'));
					break;
				case 'text':
					bus.emit('change', setItemPresence('thread', slice.filter.parents_cts[0], id, 'offline'));
					break;
				}
				subscription.remove();
			}
		});
	}
});
