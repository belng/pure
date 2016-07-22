import request from 'request';

export default async function(url: string): Promise<string> {
	return new Promise((resolve) => {
		request.get(url)
		.on('response', response => {
			if (response && response.statusCode === 200) {
				resolve(response.headers['content-type']);
			} else {
				resolve(null);
			}
		});
	});
}
