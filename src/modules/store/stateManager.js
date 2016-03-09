/* @flow */

import { bus, cache } from '../../core-client';

cache.onChange(changes => bus.emit('postchange', changes));

bus.on('change', changes => cache.put(changes));

bus.on('error', changes => {
	if (changes.state && changes.state.signup && changes.state.signup.error) {
		cache.put({
			state: {
				errors: {
					signup: new Error(changes.state.signup.error.message),
					__op__: {
						signup: 'replace'
					}
				}
			}
		});
	}
});

bus.emit('state:init', {}, (err, state) => {
	if (err) {
		return;
	}

	bus.emit('change', { state });
});
