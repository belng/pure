import winston from 'winston';
import fetchFromEndPoint from './fetchFromEndPoint';
import fetchFromMetaData from './fetchFromMetaData';

const strategies = [
	fetchFromEndPoint,
	fetchFromMetaData
];

export default async function (url) {
	return new Promise(async (resolve) => {
		if (!/^https?:\/\//i.test(url)) {
			resolve(null);
			return;
		}

		let preview;
		for (let i = 0; i < strategies.length; i++) {
			winston.debug(`Using strategy ${i} from url: ${url}`);
			preview = await strategies[i](url); // eslint-disable-line babel/no-await-in-loop
			winston.debug(`Preview after strategy ${i} for url: ${url}`, preview, '--------');
			if (preview) break;
		}

		resolve(preview || null);
	});
}
