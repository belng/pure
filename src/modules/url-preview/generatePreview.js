import fetchFromEndPoint from './fetchFromEndPoint';
import fetchFromMetaData from './fetchFromMetaData';

const strategies = [
	fetchFromEndPoint,
	fetchFromMetaData
];

export default async function generatePreview(url, cb) {
	return new Promise((resolve) => {
		if (!/^https?:\/\//i.test(url)) {
			cb();
			return;
		}

		// add the async reduce function:
		resolve(strategies.reduce(async (preview, strategy) => {
			if (preview) return preview;
			return await strategy(url);
		}));
	});
}
