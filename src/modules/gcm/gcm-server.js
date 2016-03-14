/* @flow */
import { connect } from './xmpp';
import { bus, Constants, config } from '../../core-server';
import log from 'winston';
import handleUpstreamMessage from './handleUpstreamMessage';
import createStanza from './createStanza';
import './subscribeTopics';
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

		if (entity.type === Constants.TYPE_THREAD ||
			entity.type === Constants.TYPE_TEXT ||
			entity.type === Constants.TYPE_NOTE
		) {
			log.info('sending pushnotification for thread/text/note');
			client.send(createStanza(entity));
		}
		// if (
		// 	entity.type === Constants.TYPE_THREADREL &&
		// 	entity.roles.indexOf(Constants.ROLE_MENTIONED) > -1
		// ) {
		// 	log.info('sending pushnotification for mention');
		// 	client.send(createStanza(entity));
		// }
	}
	// next();
});
