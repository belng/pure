
import { bus, cache } from '../../core-server';

bus.on('setstate', (changes) => {
	cache.put(changes);
});
