import request from 'request';
import providers from './providers';

export default async function fetchFromEndpoint(url) {
	let endpoint;
	for (let i = 0, l = providers.length; i < l; i++) {
		const provider = providers[i];

		if (provider[0].test(url)) {
			endpoint = provider[1] + '?format=json&maxheight=240&url=' + encodeURIComponent(url);
		}

		if (endpoint) break;
	}

	return new Promise((resolve) => {
		request.get(endpoint, (error, response, body) => {
			if (!error && response && response.statusCode === 200) {
				resolve(body);
			} else {
				resolve(null);
			}
		});
	});
}
