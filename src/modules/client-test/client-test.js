/* eslint-disable no-console */
import { bus, config, cache } from '../../core-client.js';

window.bus = bus;
window.config = config;
window.cache = cache;


function fbLogin(prop, accessToken) {
	bus.emit('setstate', {
		auth: {
			facebook: {
				[prop]: accessToken
			}
		}
	});
}
window.fbLogin = fbLogin;

function googleLogin(prop, accessToken) {
	bus.emit('setstate', {
		auth: {
			google: {
				[prop]: accessToken
			}
		}
	});
}
window.googleLogin = googleLogin;

/*

let connectionStatus = 'offline';
bus.on('setstate', (state) => {
	console.log('Got setstate', state);
	if (connectionStatus !== 'online') {
		if (state.app && state.app.connectionStatus === 'online') {
			connectionStatus = state.app.connectionStatus;
		}
	}
}, 1000);

*/
