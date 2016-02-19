'use strict';

let core = require('../../core-server'),
	bus = core.bus,
	config = core.config,
	resourceMap = {};

bus.on('presence/offline', resourceID => {
	delete resourceMap[resourceID];
});

bus.on('presence/online', presence => {
	resourceMap[presence.resourceId] = presence.user;
});

function resourceHandler(changes, next) {
	let signin = {};
	if (changes.auth && changes.auth.resource && !changes.app.user) {
		if (resourceMap[changes.auth.resource]) {
			changes.app.user = resourceMap[changes.auth.resource];
			next();
		} else {
			next(new Error('INVALID_RESOURCE'));
		}
	}
}

bus.on('setstate', resourceHandler, 'authentication');
