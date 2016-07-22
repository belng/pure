import 'isomorphic-fetch';

export default async function(url: string): Promise<string> {
	return new Promise((resolve) => {
		fetch(url).then((response) => {
			if (response && response.status === 200) {
				const contentType = response.headers.get('content-type');
				resolve(contentType);
			} else {
				resolve(null);
			}
		});
	});
}
