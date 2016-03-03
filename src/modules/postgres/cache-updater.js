
import { bus, cache, Constants } from '../../core-server';
import winston from 'winston';

bus.on('change', (changes) => {
	winston.info('cache-updater got change event', JSON.stringify(changes));
	if (changes.source !== 'socket') {
		cache.put(changes);
	}
}, Constants.APP_PRIORITIES.CACHE_UPDATER);
