/* eslint-disable no-console */
import { bus, config, cache } from '../../core-client.js';

window.bus = bus;
window.config = config;
window.cache = cache;


window.fbLogin = function (prop, accessToken) {
	bus.emit('setstate', {
		auth: {
			facebook: {
				[prop]: accessToken
			}
		}
	});
};

window.googleLogin = function (prop, accessToken) {
	bus.emit('setstate', {
		auth: {
			google: {
				[prop]: accessToken
			}
		}
	});
};

window.jwsLogin = function (sessionID) {
	bus.emit('setstate', {
		auth: {
			session: sessionID
		}
	});
};
