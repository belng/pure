import pg from '../../lib/pg';
import { EventEmitter } from 'events';

export default function(changes) {
	const groups = {},
		stream = new EventEmitter();

	for (const key in changes.entities) {
		if (changes.entities[key].parent && !groups[changes.entities[key].parent[0]]) {
			groups[changes.entities[key].parent[0]] = {};
			groups[changes.entities[key].parent][0][changes.entities[key].id] = changes.entities[key];
		}
	}

	for (const parent in groups) {
		const change = { entities: groups[parent] };

		pg.readStream(pg.cat({
			$: 'select * from relations where itemid =&{parent} ?',
			parent
		})).on('row', (rel) => {
			stream.emit('data', change, rel);
		});
	}

	return stream;
}
