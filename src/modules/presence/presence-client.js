/* @flow */

import { bus, cache } from '../../core-client';
import { subscribe, on } from '../store/store';
import { setPresence, setItemPresence } from '../store/actions';

subscribe({ type: 'state', path: 'connectionStatus', source: 'presence' }, status => {
	if (status === 'online') {
		cache.getState([ 'user' ], id => {
			if (id) {
				bus.emit('change', setPresence(id, 'online'));
			}
		});
	}
});

on('subscribe', options => {
	if (options.slice) {
		const { slice } = options;

		cache.getState([ 'user' ], id => {
			if (id) {
				switch (slice.type) {
				case 'thread':
					setItemPresence('room', slice.filter.parents_cts[0], id, 'online');
					break;
				case 'text':
					setItemPresence('thread', slice.filter.parents_cts[0], id, 'online');
					break;
				}
			}
		});
	}
});

on('unsubscribe', options => {
	if (options.slice) {
		const { slice } = options;

		cache.getState([ 'user' ], id => {
			if (id) {
				switch (slice.type) {
				case 'thread':
					setItemPresence('room', slice.filter.parents_cts[0], id, 'online');
					break;
				case 'text':
					setItemPresence('thread', slice.filter.parents_cts[0], id, 'online');
					break;
				}
			}
		});
	}
});
