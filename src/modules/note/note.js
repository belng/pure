/* eslint no-loop-func: 0 */
import log from 'winston';
import Counter from '../../lib/counter';
import { note as Note } from '../../models/models';
import { Constants, bus, cache, config } from '../../core-server';
import { convertRouteToURL } from '../../lib/Route';

bus.on('change', (changes, next) => {
	if (!changes.entities) {
		next();
		return;
	}
	const counter = new Counter();
	const counter1 = new Counter();
	for (const id in changes.entities) {
		const entity = changes.entities[id];
		if (entity.type === Constants.TYPE_TEXTREL) {
			if (entity.roles.indexOf(Constants.ROLE_MENTIONED) === -1) {
				continue;
			}
			counter1.inc();
			let item = changes.entities[entity.item], roomName;
			const now = Date.now(),
				noteObj = {
					group: '',
					user: entity.user,
					event: Constants.NOTE_MENTION,
					createTime: now,
					updateTime: now,
					count: 1,
					score: 50,
					data: {}
				};

			if (!item) {
				counter.inc();
				cache.getEntity(entity.item, (err, text) => {
					if (!err) item = text;
					cache.getEntity(item.parents[1], (e, r) => {
						if (e) return;
						roomName = r.name;
						counter.dec();
					});
				});
			} else {
				counter.inc();
				cache.getEntity(item.parents[1], (e, r) => {
					if (e) return;
					roomName = r.name;
					counter.dec();
				});
			}

			counter.then(() => {
				const title = roomName + ': ' + item.creator + ' mentioned you';
				const urlLink = config.server.protocol + '//' + config.server.host + convertRouteToURL({
					name: 'chat',
					props: {
						room: item.parents[1],
						thread: item.parents[0],
					},
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
					picture: `${config.server.protocol}//${config.server.host}/i/picture?user=${item.creator}&size=${48}`,
				};
				const	note = new Note(noteObj);
				console.log('Note created: ', note);
				changes.entities[note.id] = note;
				counter1.dec();
			});
		}
	}
	counter1.then(next);
	// next();
}, Constants.APP_PRIORITIES.NOTE);

log.info('Note module ready.');
