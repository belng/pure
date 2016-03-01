/* eslint-disable no-console */
import { bus, config, cache } from '../../core-client.js';

window.bus = bus;
window.config = config;
window.cache = cache;


window.fbLogin = function (prop, accessToken) {
	bus.emit('change', {
		auth: {
			facebook: {
				[prop]: accessToken
			}
		}
	});
};

window.googleLogin = function (prop, accessToken) {
	bus.emit('change', {
		auth: {
			google: {
				[prop]: accessToken
			}
		}
	});
};

window.jwsLogin = function (sessionID) {
	bus.emit('change', {
		auth: {
			session: sessionID
		}
	});
};
