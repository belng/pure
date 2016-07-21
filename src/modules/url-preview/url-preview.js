import winston from 'winston';
import { bus, config } from '../../core-server';
import * as pg from '../../lib/pg';

function generatePreview() {

}
function updatePreview(url, preview) {
	const expiry = preview.cache_age || 604800; // default expiry is 7 days
	pg.write(config.connStr, {
		$: 'INSERT INTO preview_cache(url, preview, expiry) values (&{url}, &{preview}, now() + interval \'&{expiry} second\' )',
		url,
		preview,
		expiry
	});
}

bus.on('preview/get', (req, next) => {
	pg.read(config.connStr, {
		$: 'SELECT * from preview_cache where url = &{url} and expiry > NOW()',
		url: req.url
	}, (err, res) => {
		req.response = {};

		if (err) {
			winston.warn(err.message);
			req.response.error = err;
			next();
			return;
		}

		if (res.length && res[0] && res[0].oembed) {
			req.response = res[0].oembed;
			next();
			return;
		}

		generatePreview(req.url, (error, preview) => {
			req.response = preview;
			updatePreview(req.url, preview);
			next();
		});
	});
});
