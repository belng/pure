/* eslint no-loop-func: 0 */
import log from 'winston';
import Counter from '../../lib/counter';
import Note from '../../models/note';
import { Constants, bus, cache } from '../../core-server';
import { convertRouteToURL } from '../../lib/Route';

bus.on('change', (changes) => {
	if (!changes.entities) {
		return;
	}
	const counter = new Counter();

	for (const id in changes.entities) {
		const entity = changes.entities[id];

		if (
			entity.type === Constants.TYPE_TEXTREL &&
			entity.role === Constants.ROLE_MENTIONED
		) {
			let item = changes.entities[entity.item], user;
			const now = Date.now(),
				noteObj = {
					group: '',
					user: entity.user,
					event: Constants.NOTE_MENTION,
					createTime: now,
					updateTime: now,
					count: 1,
					score: 50,
					data: {},
					type: 'mention'
				};

			if (!item) {
				counter.inc();
				cache.getEntity(entity.item, (err, text) => {
					if (!err) item = text;
				});
			}
			counter.then(() => {
				user = changes.entities[item.creator];
				if (!user) {
					cache.getEntity(item.creator, (er, u) => {
						if (!er) user = u;
					});
				}
				const title = item.creator + 'mentioned you';
				const urlLink = convertRouteToURL({
					name: 'chat',
					props: {
						room: item.parents[1],
						thread: item.parents[0]
					}
				});
				noteObj.group = item.parents[0];
				noteObj.data = {
					id: item.id,
					creator: item.creator,
					body: item.body,
					title,
					type: Constants.NOTE_MENTION,
					thread: entity.type === Constants.TYPE_TEXTREL ? item.parents[0] : null,
					room: entity.type === Constants.TYPE_TEXTREL ? item.parents[1] : item.parents[0],
					link: urlLink,
					picture: user && user.meat && user.meta.picture
				};
				const	note = new Note(noteObj);
				changes.entities[note.getId()] = note;
			});
		}
	}
}, Constants.APP_PRIORITIES.CACHE_UPDATER);

log.info('Note module ready.');
