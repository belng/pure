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


bus.on('change', (changes) => {
	if (!changes.entities) {
		// next();
		return;
	}
	for (const i in changes.entities) {
		const entity = changes.entities[i];

		if (entity.type === Constants.TYPE_THREAD) {
			const counter = new Counter();
			const title = entity.creator + 'created a thread',
				urlLink = convertRouteToURL({
					name: 'room',
					props: {
						room: entity.parents[0]
					}
				});

			log.info('sending pushnotification for thread', entity);
			let user = changes.entities[entity.creator];
			if (!user) {
				counter.inc();
				cache.getEntity(entity.creator, (err, u) => {
					if (!err)	user = u;
					counter.dec();
				});
			}
			counter.then(() => {
				console.log("user is here: ", user)
				const pushData = {
					count: 1,
					data: {
						body: entity.body,
						creator: entity.creator,
						id: entity.id,
						room: entity.parents[0],
						title,
						thread: entity.id,
						type: 'thread',
						link: urlLink,
						picture: user.meta.picture
					},
					updateTime: Date.now(),
					type: entity.type
				};

				console.log("gcm entity:", pushData)
				client.send(createStanza(pushData));
			});
		}
		if (entity.type === Constants.TYPE_TEXT) {
			const counter = new Counter();
			const title = entity.creator + 'replied',
				urlLink = convertRouteToURL({
					name: 'chat',
					props: {
						room: entity.parents[1],
						thread: entity.parents[0]
					}
				});

			log.info('sending pushnotification for text', entity);
			let user = changes.entities[entity.creator];
			if (!user) {
				counter.inc();
				cache.getEntity(entity.creator, (err, u) => {
					if (!err)	user = u;
					counter.dec();
				});
			}
			counter.then(() => {
				console.log("user is here: ", user)
				const pushData = {
					count: 1,
					data: {
						body: entity.body,
						creator: entity.creator,
						id: entity.id,
						room: entity.parents[1],
						title,
						thread: entity.parents[0],
						type: 'reply',
						link: urlLink,
						picture: user.meta.picture
					},
					updateTime: Date.now(),
					type: entity.type
				};

				console.log("gcm entity:", pushData)
				client.send(createStanza(pushData));
			});
		}
		if (entity.type === Constants.TYPE_NOTE) {
			log.info('sending pushnotification for mention');
			client.send(createStanza(entity));
		}
	}
	// next();
});
