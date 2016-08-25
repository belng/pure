/* @flow */
/* eslint-disable no-console */

import crypto from 'crypto';
import route from 'koa-route';
import winston from 'winston';
import { bus, config } from '../../core-server';
import * as pg from '../../lib/pg';
import promisify from '../../lib/promisify';
import isNativeURL from './isNativeURL';
import isShortURL from './isShortURL';
import extractPath from './extractPath';

/*
	IMPLEMENTATION DETAILS:
		- extract path from the long URL { regex (/https?:\/\/[^\/]+/) }.
		- Short URL will be 6 characters url safe base64 hash.
		- In case of a collision, the first 6 characters will be a substring of the base64 hash
		  and the 7th character will be appended from the chars string in a sequential manner.
		- In case of getShortURL api call, simply hash and try to insert it to the DB.
		- If everything goes well it means we have successfully created the short url.
		- In case of an error there are two possibilities:
		  - There is a collision.
		  - The long url already exists.
		- Do a LIKE query with the (0..6) substring of the hash.
		- On getting back results, check whether the long URL of the results returned from
		  the DB matches the long URL passed as parameter.
		- If any of them does, return the corresponding short URL.
		- In any other case, we have a collision. We can resolve it by appending 7th character which
		  is 1 place higher than the highest 7th position character of the short URLS from the result.
*/

const chars = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
const doReadQuery = promisify(pg.read.bind(pg, config.connStr));
const doWriteQuery = promisify(pg.write.bind(pg, config.connStr));

const { protocol, host } = config.server;

const makeURLSafeHash = (pathFromLongURL: string): string => {
	const md5Hash = crypto.createHash('md5').update(pathFromLongURL).digest('base64');
	// regex to make url safe hash, converts '+' to '-', '/' to '_', removes "=" from the end
	const urlSafeHash = md5Hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	return urlSafeHash.slice(0, 6);
};

const insertLongURL = (shortURL: string, longURL: string): Promise<Array<{rowCount: number}>> => {
	return doWriteQuery([ {
		$: `INSERT INTO urls (
			shorturl, longurl
		) VALUES (
			&{shortURL}, &{longURL}
		)`,
		shortURL,
		longURL
	} ]);
};

export const getShortURL = (longURL: string): Promise<string> => {

	if (!isNativeURL(longURL, host)) {
		throw new Error(`The URL is not a valid ${host} url`);
	}

	const pathFromLongURL = extractPath(longURL);
	const shortURL = makeURLSafeHash(pathFromLongURL);

	if (pathFromLongURL === '') {
		return Promise.resolve('');
	} else {
		// Try inserting long URL and its hash as the short URL.
		return insertLongURL(shortURL, pathFromLongURL)
			// in case of a successful insertion, simply return the hash.
			.then((result) => {
				// result: [{.., rowCount: _, ...}, ..]
				if (result[0].rowCount === 1) {
					winston.info('Insert operation performed successfully.');
					return shortURL;
				}
				return null;
			})
			// in case of an error, take proper measures.
			.catch((error) => {
				winston.info(`something went wrong while perfoming insertion, ${error}`);
				return doReadQuery({
					$: 'SELECT shorturl, longurl FROM urls WHERE shorturl LIKE &{shortURL}',
					shortURL: shortURL + '%'
				})
				.then((links) => {
					// links: [{shorturl: _, longurl: _}, ...]
					let maxIndex = 0;
					for (const link of links) {
						if (link.longurl === pathFromLongURL) {
							winston.info('The long url already exists');
							return link.shorturl;
						} else if (link.shorturl.length === 7) {
							const indexInChar = chars.indexOf(link.shorturl[6]);
							if (indexInChar >= maxIndex) {
								if (indexInChar < chars.length - 1) {
									maxIndex = indexInChar + 1;
								} else {
									throw new Error(`Max collisions exceeded for hash: ${shortURL}`);
								}
							}
						}
					}
					return insertLongURL(shortURL + chars[maxIndex], pathFromLongURL)
						.then(() => {
							return shortURL + chars[maxIndex];
						});
				});
			});
	}
};

export const getLongURL = (shortURL: string): Promise<string> => {
	const path = extractPath(shortURL);
	return doReadQuery({
		$: 'SELECT * FROM urls WHERE shorturl = &{path}',
		path
	})
	.then((result) => {
		if (result.length > 0) {
			return result[0].longurl;
		} else {
			return null;
		}
	});
};

/*
	Demo api call
		getShortURL('https://ict4kids.files.wordpress.com/2013/05/mrc-2.png')
			.then((result) => {
				console.log(result);
			})
			.catch((error) => {
				console.error(`something went wrong while getting the short URL, ${error}`);
			});

		getLongURL('http://bel.ng/28XYe8')
			.then((result) => {
				console.log(result);
			})
			.catch((error) => {
				console.error(`something went wrong while getting the long URL, ${error}`);
			});
*/

bus.on('http/init', app => {
	app.use(function *(next) {
		const path = this.request.path.slice(1);

		if (isShortURL(path)) {
			const longURL = yield getLongURL(path);
			if (longURL) {
				this.redirect(longURL);
				return;
			}
			this.throw(404, 'not found');
		}

		yield *next;
	});

	app.use(route.get('/x/url-shortener/expand', function *() {
		const query = this.request.query;
		if (query && query.url) {
			try {
				const path = yield getLongURL(query.url);
				this.body = protocol + '//' + host + '/' + path;
			} catch (e) {
				this.throw(500, e.message);
			}
		} else {
			this.throw(400, 'Short URL was not provided !!');
		}
	}));

	app.use(route.get('/x/url-shortener/shorten', function *() {
		const query = this.request.query;
		if (query && query.url) {
			try {
				const path = yield getShortURL(query.url);
				this.body = protocol + '//' + host + '/' + path;
			} catch (e) {
				this.throw(500, e.message);
			}
		} else {
			this.throw(400, 'Long URL was not provided !!');
		}
	}));
});
