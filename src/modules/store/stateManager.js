/* @flow */

import { bus, cache } from '../../core-client';

cache.onChange(changes => bus.emit('postchange', changes));

bus.on('change', changes => cache.put(changes));
bus.on('error', changes => cache.put(changes));

bus.emit('state:init', {}, (err, state) => {
	if (err) {
		return;
	}

	bus.emit('change', { state });
});
