'use strict';

import { TABLES, COLUMNS, TYPES, ROLES } from '../../lib/schema';
import Counter from '../../lib/counter';
import Note from '../../models/note';
import { Constants, bus, cache } from '../../core-server';

bus.on('change', (changes, next) => {
	if (!changes.entities) return next();
	let counter = new Counter(), note;

	for (let id in changes.entities) {
		let entity = changes.entities[id];

		if (
			(entity.type === Constants.TYPE_TEXTREL ||
			entity.type === Constants.TYPE_THREADREL) &&
			entity.role === Constants.ROLE_MENTIONED
		) {
			let item = changes.entities[entity.item],
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
}, 'modifier');
