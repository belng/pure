import fetchFromEndPoint from './fetchFromEndPoint';

// function extractDomain(url) {
// 	let domain = url.split('/')[2];
// 	domain = domain.split(':')[0];
// 	return domain;
// }


const strategies = [
	fetchFromEndPoint
];

export default async function generatePreview(url, cb) {
	if (!/^https?:\/\//i.test(url)) {
		cb();
		return;
	}

	strategies.reduce(async (preview, strategy) => {
		if (preview) return preview;
		return await strategy(url);
	});
}
