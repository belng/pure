/* @flow */
import { connect } from './xmpp';
import { bus, Constants, config, cache } from '../../core-server';
import log from 'winston';
import Counter from '../../lib/counter';
import handleUpstreamMessage from './handleUpstreamMessage';
import createStanza from './createStanza';
import './subscribeTopics';
import { convertRouteToURL } from '../../lib/Route';
let client;

if (config.gcm.senderId) {
	log.info('GCM module ready.');
	connect((e, c) => {
		if (e) log.error(e);
		else {
			client = c;
			handleUpstreamMessage(c);
		}
	});
} else {
	log.info('GCM module not enabled');
}

function sendStanza(changes, entity) {
	if (entity.type === Constants.TYPE_THREAD) {
		if (!entity.createTime || entity.createTime !== entity.updateTime) {
			log.info('not new thread: ', entity);
			return;
		}
		// console.log("sdjkfhjd g: ", entity)
		const title = entity.creator + ' started a discussion',
			urlLink = config.server.protocol + '//' + config.server.host + convertRouteToURL({
				name: 'room',
				props: {
					room: entity && entity.parents[0]
				}
			});

		log.info('sending pushnotification for thread', entity, urlLink);
			const pushData = {
				count: 1,
				data: {
					body: entity.name,
					creator: entity.creator,
					id: entity.id,
					room: entity && entity.parents[0],
					title,
					thread: entity.id,
					type: 'thread',
					link: urlLink,
					picture: `${config.server.protocol}//${config.server.host}/i/picture?user=${entity.creator}&size=${48}`
				},
				updateTime: Date.now(),
				type: entity.type
			};

			// console.log("gcm entity:", pushData)
			client.send(createStanza(pushData));
	}
	if (entity.type === Constants.TYPE_TEXT) {
		log.info('push notification for text: ', entity);
		if (entity.createTime !== entity.updateTime) {
			log.info('not new text: ', entity);
			return;
		}
		const counter = new Counter();
		const title = entity.creator + ' replied',
			urlLink = config.server.protocol + '//' + config.server.host + convertRouteToURL({
				name: 'chat',
				props: {
					room: entity && entity.parents[1],
					thread: entity && entity.parents[0]
				}
			});

		log.info('pushnotification: ', entity, urlLink);
		let user = changes.entities[entity.creator];
		if (!user || !user.meta) {
			counter.inc();
			cache.getEntity(entity.creator, (err, u) => {
				if (!err)	user = u;
				counter.dec();
			});
		}
		counter.then(() => {
			const pushData = {
				count: 1,
				data: {
					body: entity.body,
					creator: entity.creator,
					id: entity.id,
					room: entity && entity.parents[1],
					title,
					thread: entity && entity.parents[0],
					type: 'reply',
					link: urlLink,
					picture: user.meta.picture
				},
				updateTime: Date.now(),
				type: entity.type
			};

			log.info('sending pushnotification for text', pushData);
			client.send(createStanza(pushData));
		});
	}
	if (entity.type === Constants.TYPE_NOTE) {
		log.info('sending pushnotification for mention');
		client.send(createStanza(entity));
	}
}

bus.on('change', (changes) => {
	if (!changes.entities) {
		return;
	}
	for (const i in changes.entities) {
		const entity = changes.entities[i];
		sendStanza(changes, entity);
	}
});
