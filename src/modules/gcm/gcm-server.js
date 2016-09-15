/* @flow */

import connect from './xmpp';
import { bus, config, cache } from '../../core-server';
import Logger from '../../lib/logger';
import * as Constants from '../../lib/Constants';
import uid from '../../lib/uid-server';
import promisify from '../../lib/promisify';
import handleUpstreamMessage from './handleUpstreamMessage';
import createStanza from './createStanza';
import { convertRouteToURL } from '../../lib/Route';
import type { Note } from '../../lib/schemaTypes';
import './subscribeTopics';

const getEntityAsync = promisify(cache.getEntity.bind(cache));
const log = new Logger(__filename);

let client;

if (config.gcm.senderId) {
	log.info('GCM module ready.');
	connect((e, c) => {
		if (e) {
			log.error(e);
			return;
		} else {
			client = c;
			handleUpstreamMessage(c);
		}
	});
} else {
	log.info('GCM module not enabled');
}

async function sendStanza(changes, entity) {

	if (entity.type === Constants.TYPE_THREAD) {
		if (!entity.createTime || entity.createTime !== entity.updateTime) {
			log.info('not new thread: ', entity);
			return;
		}

		const room = await getEntityAsync(entity.parents[0]);
		const title = `New discussion in ${room.name}`;
		const link = config.server.protocol + '//' + config.server.host + convertRouteToURL({
			name: 'chat',
			props: {
				room: entity && entity.parents[0],
				thread: entity && entity.id,
				source: 'notification',
			},
		});

		log.info('sending pushnotification for thread', entity, link);

		const pushData: Note = {
			group: entity.id,
			count: 1,
			score: 10,
			data: {
				body: entity.name,
				creator: entity.creator,
				id: entity.id,
				room: {
					id: room.id,
					name: room.name,
				},
				title,
				thread: {
					id: entity.id,
				},
				picture: `${config.server.protocol}//${config.server.host}/i/picture?user=${entity.creator}&size=${128}`,
				link,
			},
			event: Constants.NOTE_THREAD,
			createTime: Date.now(),
			updateTime: Date.now(),
			type: entity.type,
		};

		client.send(createStanza(uid(), pushData));
	}

	if (entity.type === Constants.TYPE_TEXT) {
		if (entity.createTime !== entity.updateTime) {
			return;
		}

		log.info('push notification for text: ', entity);

		const room = await getEntityAsync(entity.parents[1]);
		const thread = await getEntityAsync(entity.parents[0]);
		const title = `New reply in ${room.name}`;
		const link = config.server.protocol + '//' + config.server.host + convertRouteToURL({
			name: 'chat',
			props: {
				room: entity && entity.parents[1],
				thread: entity && entity.parents[0],
				source: 'notification',
			},
		});

		log.info('pushnotification: ', entity, link);

		const pushData: Note = {
			group: entity.id,
			count: 1,
			score: 30,
			data: {
				body: entity.meta && entity.meta.photo ? '📷 [photo]' : entity.body,
				creator: entity.creator,
				id: entity.id,
				room: {
					id: room.id,
					name: room.name,
				},
				title,
				thread: {
					id: thread.id,
					name: thread.name,
				},
				picture: `${config.server.protocol}//${config.server.host}/i/picture?user=${entity.creator}&size=${128}`,
				link,
			},
			event: Constants.NOTE_REPLY,
			createTime: Date.now(),
			updateTime: Date.now(),
			type: entity.type,
		};

		log.info('sending pushnotification for text', pushData);

		client.send(createStanza(uid(), pushData));
	}

	if (entity.type === Constants.TYPE_NOTE) {
		log.info('sending pushnotification for note');
		client.send(createStanza(uid(), entity));
	}
}


// console.log("Constants.APP_PRIORITIES.GCM", Constants.APP_PRIORITIES.GCM);
bus.on('postchange', (changes) => {
	if (!changes.entities || !config.gcm.senderId) {
		return;
	}
	for (const i in changes.entities) {
		const entity = changes.entities[i];
		sendStanza(changes, entity);
	}
}, Constants.APP_PRIORITIES.GCM);
