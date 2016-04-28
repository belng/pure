/* @flow */

import {
	APP_PRIORITIES,
	TYPE_NOTE,
	TYPE_TEXTREL,
	NOTE_MENTION,
	ROLE_MENTIONED,
} from '../../lib/Constants';
import promisify from '../../lib/promisify';
import { convertRouteToURL } from '../../lib/Route';
import { note as Note } from '../../models/models';
import { bus, cache, config } from '../../core-server';
import type {
	Note as NoteType,
	Text as TextType,
	Thread as ThreadType,
	Room as RoomType,
	TextRel as TextRelType,
} from '../../lib/schemaTypes';

const server = `${config.server.protocol}//${config.server.host}`;

const getEntityAsync = promisify(cache.getEntity.bind(cache));

async function createMention(textrel: TextRelType, text: ?TextType): Promise<?Note> {
	let room: ?RoomType, thread: ?ThreadType;

	if (text && text.parents) {
		thread = await getEntityAsync(text.parents[0]);
		room = await getEntityAsync(text.parents[1]);
	}

	if (
		text && text.id &&
		room && room.id &&
		thread && thread.id
	) {
		const now = Date.now();
		const note: NoteType = {
			id: '', // make flow happy
			group: thread.id,
			user: textrel.user,
			event: NOTE_MENTION,
			type: TYPE_NOTE,
			createTime: now,
			updateTime: now,
			count: 1,
			score: 50,
			data: {
				id: text.id,
				creator: text.creator,
				picture: `${server}/i/picture?user=${text.creator}&size=${128}`,
				room: {
					id: room.id,
					name: room.name,
				},
				thread: {
					id: thread.id,
					name: thread.name,
				},
				link: server + convertRouteToURL({
					name: 'chat',
					props: {
						room: room.id,
						thread: thread.id,
					}
				}),
				title: `${room.name}: ${text.creator} mentioned you in ${thread.name}`,
				body: text.body,
			},
		};

		return new Note(note);
	}

	return null;
}

function isMentioned(entity): boolean {
	return entity.type === TYPE_TEXTREL && entity.roles && entity.roles.includes(ROLE_MENTIONED);
}

async function getNotesFromChanges(changes): Promise<Array<?Note>> {
	const promises = [];

	if (changes.entities) {
		for (const id in changes.entities) {
			const relation = changes.entities[id];

			if (isMentioned(relation)) {
				promises.push(createMention(relation, changes.entities[relation.item]));
			}
		}
	}

	return await Promise.all(promises);
}

async function addNotesToChanges(changes) {
	const notes = await getNotesFromChanges(changes);

	for (let i = 0, l = notes.length; i < l; i++) {
		const note = notes[i];

		if (note && note.id) {
			changes.entities[note.id] = note;
		}
	}
}

bus.on('change', async (changes, next) => {
	try {
		await addNotesToChanges(changes);
		next();
	} catch (err) {
		next(err);
	}
}, APP_PRIORITIES.NOTE);
