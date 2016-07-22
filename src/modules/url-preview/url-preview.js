import winston from 'winston';
import { bus, config } from '../../core-server';
import * as pg from '../../lib/pg';
import generatePreview from './generatePreview';

function updatePreview(url, preview) {
	pg.write(config.connStr, [ {
		$: 'INSERT INTO preview_cache(url, preview, expiry) values (&{url}, &{preview}, now() + INTERVAL \'7 day\')',
		url,
		preview
	} ]);
}

bus.on('preview/get', (req, next) => {
	winston.info(`Got request for preview: ${req.url}`);
	pg.read(config.connStr, {
		$: 'SELECT * from preview_cache where url = &{url} and expiry > NOW()',
		url: req.url
	}, async (err, res) => {
		req.response = {};

		if (err) {
			winston.warn(err.message);
			return next(err);
		}

		if (res.length && res[0] && res[0].preview) {
			req.response.preview = res[0].preview;
			return next();
		}

		try {
			req.response.preview = await generatePreview(req.url);
			updatePreview(req.url, req.response.preview);
			return next();
		} catch (e) {
			return next(e);
		}
	});
});
