/* @flow */
/* eslint-disable no-console */

import route from 'koa-route';
import URLSafebase64URL from 'base64-url';
import { bus, config } from '../../core-server';
import * as pg from '../../lib/pg';
import promisify from '../../lib/promisify';

/*
	IMPLEMENTATION DETAILS:
		- extract path regex (/https?:\/\/[^\/]+/)
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

const isShortURL = (shortURL: string): boolean => {
	if (shortURL.length === 6 || shortURL.length === 7) {
		return /[a-zA-Z-_]+$/.test(shortURL);
	}
	return false;
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
	const pathFromLongURL = longURL.replace(/https?:\/\/[^\/]+/, '');
	const shortURL = URLSafebase64URL.encode(pathFromLongURL).slice(0, 6);
	// Try inserting long URL and its hash as the short URL.
	return insertLongURL(shortURL, pathFromLongURL)
		// in case of a successful insertion, simply return the hash.
		.then((result) => {
			if (result[0].rowCount === 1) {
				console.log('Insert operation performed successfully.');
				return shortURL;
			}
			return null;
		})
		// in case of an error, take proper measures.
		.catch((error) => {
			console.log(`something went wrong while perfoming insertion, ${error}`);
			return doReadQuery({
				$: 'SELECT shorturl FROM urls WHERE longurl = &{pathFromLongURL}',
				pathFromLongURL
			})
			.then((data) => {
				const results = data.map(item => item.shorturl);

				if (results.length === 0) {
					// case 1: we have a collision
					return doReadQuery({
						$: 'SELECT shorturl FROM urls WHERE shorturl LIKE &{shortURL}',
						shortURL: shortURL + '%'
					})
					.then((result) => {
						if (result.length > 0) {
							const sortedResults = result.sort();
							const lastElement = sortedResults[sortedResults.length - 1];
							if (lastElement.length === 7) {
								const indexInChar = chars.indexOf(lastElement[6]);
								if (indexInChar < chars.length - 1) {
									return shortURL + chars[indexInChar + 1];
								}
							} else {
								return shortURL + chars[0];
							}
						}
						return null;
					});
				} else {
					// case 2: we already have the long url
					console.log('The long url already exists');
					return results[0];
				}
			});
		});
};

export const getLongURL = (shortURL: string): Promise<string> => {
	return doReadQuery({
		$: 'SELECT * FROM urls WHERE shorturl = &{shortURL}',
		shortURL
	})
	.then((result) => {
		if (result.length > 0) {
			return doWriteQuery([ {
				$: 'UPDATE urls SET count = &{count} WHERE shorturl = &{shortURL}',
				count: result[0].count + 1,
				shortURL
			} ])
			.then(() => {
				return result[0].longurl;
			});
		} else {
			return null;
		}
	});
};

// getShortURL('https://ict4kids.files.wordpress.com/2013/05/mrc-2.png')
// 	.then((result) => {
// 		console.log(result);
// 	})
// 	.catch((error) => {
// 		console.log(`something went wrong while getting the short URL, ${error}`);
// 	});

// getLongURL('LzIwMT')
// 	.then((result) => {
// 		console.log(result);
// 	})
// 	.catch((error) => {
// 		console.log(`something went wrong while getting the long URL, ${error}`);
// 	});

bus.on('http/init', app => {
	app.use(route.get('*', function *() {
		const path = this.request.url.slice(1);
		try {
			if (isShortURL(path)) {
				const longURL = yield getLongURL(path);
				if (longURL) {
					this.response.redirect(longURL);
				}
			}
		} catch (e) {
			// Do nothing !
		}
	}));
});
