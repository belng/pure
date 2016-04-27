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
	User as UserType,
} from '../../lib/schemaTypes';

const server = `${config.server.protocol}//${config.server.host}`;

const getEntityAsync = promisify(cache.getEntity.bind(cache));

function getEntities(ids: Array<string | null>): Array<Object | null> {
	return ids.map(id => id ? getEntityAsync(id) : null);
}

async function getItemsData(relation): Promise<{
	creator: ?UserType;
	text: ?TextType;
	room: ?RoomType;
	thread: ?ThreadType;
}> {
	let creator, room, thread;

	const text = await getEntityAsync(relation.item);

	if (text && text.parents) {
		[
			thread,
			room,
			creator,
		] = await getEntities([ text.parents[0], text.parents[1], text.creator ]);
	}

	return { creator, text, room, thread };
}

async function createMention(relation): Promise<?Note> {
	const { creator, text, room, thread } = await getItemsData(relation);
	const now = Date.now();

	if (
		creator && creator.id &&
		text && text.id &&
		room && room.id &&
		thread && thread.id
	) {
		const note: NoteType = {
			id: '', // make flow happy
			group: thread.id,
			user: relation.user,
			event: NOTE_MENTION,
			createTime: now,
			updateTime: now,
			count: 1,
			score: 50,
			data: {
				id: text.id,
				creator: creator.id,
				room: room.id,
				thread: thread.id,
				picture: `${server}/i/picture?user=${creator.id}&size=${128}`,
				link: server + convertRouteToURL({
					name: 'chat',
					props: {
						room: room.id,
						thread: thread.id,
					}
				}),
				title: `${room.name}: ${creator.id} mentioned you`,
				body: text.body,
			},
			type: TYPE_NOTE
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
				promises.push(createMention(relation));
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
