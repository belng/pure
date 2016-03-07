/* eslint no-loop-func: 0 */
import log from 'winston';
import Counter from '../../lib/counter';
import Note from '../../models/note';
import { Constants, bus, cache } from '../../core-server';

bus.on('change', (changes, next) => {
	if (!changes.entities) {
		next();
		return;
	}
	const counter = new Counter();
	let note;

	for (const id in changes.entities) {
		const entity = changes.entities[id];

		if (
			(entity.type === Constants.TYPE_TEXTREL ||
			entity.type === Constants.TYPE_THREADREL) &&
			entity.role === Constants.ROLE_MENTIONED
		) {
			const item = changes.entities[entity.item],
				noteObj = {
					user: entity.user,
					event: Constants.NOTE_MENTION,
					eventTime: Date.now(),
					count: 1,
					score: 50,
					type: Constants.TYPE_NOTE
				};

			if (!item) {
				counter.inc();
				cache.getEntity(entity.item, (err, text) => {
					if (err) log.error(err);
					noteObj.group = text.parents[0][0];
					noteObj.data = {
						textId: text.id,
						from: text.creator,
						text: text.body,
						thread: text.name,
						createTime: text.createTime,
						room: entity.type === Constants.TYPE_TEXTREL ? text.parents[0][1] : text.parents[0][0]
					};
					note = new Note(noteObj);
					changes.entities[note.getId()] = note;
					counter.dec();
				});
			} else {
				noteObj.group = item.parents[0][0];
				noteObj.data = {
					textId: item.id,
					from: item.creator,
					text: item.body,
					thread: item.name,
					createTime: item.createTime,
					room: entity.type === Constants.TYPE_TEXTREL ? item.parents[0][1] : item.parents[0][0]
				};
				note = new Note(noteObj);
				changes.entities[note.getId()] = note;
			}
		}
	}
	counter.then(next);
}, Constants.APP_PRIORITIES.CACHE_UPDATER);

log.info('Note module ready.');
