import { bus, cache } from '../../core-client';

bus.on('change', changes => cache.put(changes));
cache.onChange(changes => bus.emit('postchange', changes));
