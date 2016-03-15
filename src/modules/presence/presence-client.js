/* @flow */

import { bus, cache } from '../../core-client';
import { subscribe, on } from '../store/store';
import { setPresence, setItemPresence } from '../store/actions';

// TODO: remove this when cache bug is fixed.
let lastUser;

subscribe({ type: 'state', path: 'session', source: 'presence' }, () => {
	cache.getState([ 'user' ], id => {
		if (id) {
			bus.emit('change', setPresence(id, 'online'));
		}
	});
});

subscribe({ type: 'state', path: 'user', source: 'presence' }, id => {
	if (lastUser === id) return;
	lastUser = id;
	if (id) bus.emit('change', setPresence(id, 'online'));
});

on('subscribe', options => {
	if (options.slice) {
		const { slice } = options;

		const id = cache.getState([ 'user' ]);

		if (id) {
			switch (slice.type) {
			case 'thread':
				const room = slice.filter.parents_cts[0];

				cache.getEntity(`${id}_${room}`, (err, result) => {
					if (err) return;
					bus.emit('change', setItemPresence('room', room, id, 'online', !result));
				});
				break;
			case 'text':
				const thread = slice.filter.parents_cts[0];
				cache.getEntity(`${id}_${thread}`, (err, result) => {
					if (err) return;
					bus.emit('change', setItemPresence('thread', thread, id, 'online', !result));
				});
				break;
			}
		}
	}
});

on('unsubscribe', options => {
	if (options.slice) {
		const { slice } = options;
		const id = cache.getState([ 'user' ]);

		if (id) {
			switch (slice.type) {
			case 'thread':
				const room = slice.filter.parents_cts[0];

				cache.getEntity(`${id}_${room}`, (err, result) => {
					if (err) return;
					bus.emit('change', setItemPresence('room', room, id, 'offline', !result));
				});
				break;
			case 'text':
				const thread = slice.filter.parents_cts[0];

				cache.getEntity(`${id}_${thread}`, (err, result) => {
					if (err) return;
					bus.emit('change', setItemPresence('thread', thread, id, 'offline', !result));
				});
				break;
			}
		}
	}
});
