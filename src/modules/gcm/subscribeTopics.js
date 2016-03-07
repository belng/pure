/* @flow */
import { config, bus, Constants, cache } from '../../core-server';
import Counter from '../../lib/counter';
import log from 'winston';
import request from 'request';

function unsubscribeTopics (iid) {
	const opts = {
		url: `https://iid.googleapis.com/iid/info/${iid}?details=true`,
		method: 'GET',
		headers: {
			Authorozation: config.gcm.apiKey
		}
	};

	request(opts, (e, r, b) => {
		if (e) {
			log.error(e);
			return;
		}
		const topicsSubscribed = b.rel.topics;

		opts.method = 'POST';
		opts.url = 'https://iid.googleapis.com/iid/v1:batchRemove';
		// unsubscribe thread topics
		for (const topic in topicsSubscribed) {
			if (!/thread-/.test(topic)) {
				return;
			}
			request({
				...opts,
				to: topic,
				registration_tokens: [ iid ]
			}, (err, rspns, bdy) => {
				if (!err) {
					log.info('unsubscribed from ', topic);
					log.info(bdy);
				}
			});
		}
	});
}

function subscribe (userRel: Object) {
	// console.log(userRel);
	const iid_token = userRel.user.params.regId,
		options = {
			url: `https://iid.googleapis.com/iid/v1/${iid_token}/rel/topics/${userRel.topic}`,
			json: true,
			method: 'POST',
			headers: {
				Authorization: `key=${config.gcm.apiKey}`
			}
		};

	request(options, (error, response, body) => {
		if (error) {
			log.error(error);
			if (error.type === 'TOO_MANY_TOPICS') {
				log.info('unsubscribe few old topics');
				unsubscribeTopics(iid_token);
			} else {
				log.error(error);
				subscribe(userRel);
			}
		}
		if (body.error) {
			log.error(body);
			// console.log(options);
		} else {
			log.info('succefully subscribed to: ' + userRel.topic, body);
		}
	});
}

bus.on('setstate', (changes, next) => {
	const counter = new Counter();

	if (!changes.entities) {
		next();
		return;
	}

	for (const i in changes.entities) {
		const entity = changes.entities[i];

		if (entity.type === Constants.TYPE_THREADREL ||
		entity.type === Constants.TYPE_ROOMREL) {
			let user = changes.entities[entity.user];

			if (!user) {
				counter.inc();
				cache.getEntity(entity.user, (e, u) => {
					user = u;
					counter.dec();
				});
			}
			counter.then(() => {
				log.info('subscribe ' + user.id + ' to ' + entity.item);
				subscribe({
					user,
					topic: entity.type === Constants.TYPE_ROOMREL ? 'room-' + entity.item : 'thread-' + entity.item
				});
				next();
			});
		}
		if (entity.type === Constants.TYPE_USER) {
			if (entity.createtime) {
				// subscribe for mention when user is created
				subscribe({
					entity,
					topic: 'note-' + entity.id
				});
				next();
			}
		}
	}
});
