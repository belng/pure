import { bus, Constants } from '../../core-server';

const resourceMap = {};

bus.on('presence/offline', resourceID => {
	delete resourceMap[resourceID];
});

bus.on('presence/online', presence => {
	resourceMap[presence.resourceId] = presence.user;
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
