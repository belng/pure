
import { bus, cache } from '../../core-server';

bus.on('change', (changes) => {
	cache.put(changes);
});
