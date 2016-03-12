/* @flow */

export default async function(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();

		request.onload = function() {
			if (request.status === 200) {
				resolve(request.getResponseHeader('content-type'));
			} else {
				reject(new Error(request.responseText));
			}
		};

		request.open('HEAD', url, true);
		request.send();
	});
}
