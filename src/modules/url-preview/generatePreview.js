import fetchFromEndPoint from './fetchFromEndPoint';
import fetchFromMetaData from './fetchFromMetaData';

const strategies = [
	fetchFromEndPoint,
	fetchFromMetaData
];

export default async function generatePreview(url, cb) {
	return new Promise(async (resolve) => {
		if (!/^https?:\/\//i.test(url)) {
			cb();
			return;
		}

		let preview;
		for (let i = 0; i < strategies.length; i++) {
			preview = await strategies[0](url); // eslint-disable-line babel/no-await-in-loop
			if (preview) break;
		}

		resolve(preview || null);
	});
}
