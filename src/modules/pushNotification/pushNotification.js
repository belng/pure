/* @flow */
import xmpp from './xmpp.js';
import { bus, Constants } from '../../core-server';
import log from 'winston';

bus.on('setstate', (changes, next) => {
	if (!changes.entities) {
		next();
		return;
	}
	for (const i in changes.entities) {
		const entity = changes.entities[i];

		if (entity.type === Constants.TYPE_NOTE) {
			log.info('sending pushnotification');
			xmpp(entity);
		}
	}
	next();
});
