import { bus, Constants, cache } from '../../core-server';

const resourceMap = {};

bus.on('presence/offline', presence => {
	const user = resourceMap[presence.resource];

	if (user) {
		cache.getEntity(user, (err, u) => {
			if (err) {
				return;
			}

			u.resources = u.resources || {};
			u.resources.__op__ = {
				[presence.resource]: 'delete'
			};

			bus.emit('change', {
				entities: {
					[user]: u
				}
			});
		});
	}

	delete resourceMap[presence.resource];
});

bus.on('presence/online', presence => {
	resourceMap[presence.resource] = presence.user;
});

function resourceHandler(changes) {

	if (changes.state && changes.state.user) {
		resourceMap[changes.auth.resource] = changes.state.user;
	} else if (changes.auth && changes.auth.resource) {
		changes.state = changes.state || {};
		if (resourceMap[changes.auth.resource]) {
			changes.state.user = resourceMap[changes.auth.resource];
			const r = changes.response = changes.response || {};
			const state = r.state = r.state || {};

			state.user = state.user || changes.state.user;
		}
	}


}

bus.on('change', resourceHandler, Constants.APP_PRIORITIES.AUTHENTICATION_RESOURCE);
bus.on('s3/getPolicy', resourceHandler, Constants.APP_PRIORITIES.AUTHENTICATION_RESOURCE);
