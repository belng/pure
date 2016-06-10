/* flow */
/* eslint-disable no-console, consistent-this, no-cond-assign */

import feedParser from 'feed-read';
import _ from 'lodash';
import { bus, config } from '../../core-server';
import winston from 'winston';
import * as pg from '../../lib/pg';
import promisify from '../../lib/promisify';
import uuid from 'node-uuid';
import { TYPE_THREAD, TAG_RSS_NEWS_SEED } from '../../lib/Constants';
import type { Thread } from '../../lib/schemaTypes';

/*
	Implementation Details:
		- TABLES:
			- FEEDS:
				column                   type
			  -----------------------------------------
			    url		                text
		        MTBU                    float(24)
				lastrequesttime         bigint
				lastupdatetime          bigint

			- ARTICLES:
				column                   type
			  -----------------------------------------
			    url		                text
		        rawjson                 jsonb
				terms    		        tsvector

		- ALGORITHM:
			- Check if the feeds table is empty.
			- IF empty:
				- insert a seed url in the feeds table (one time operation).
			- Truncate the articles table.
			- Filter feeds where lastrequesttime < ( NOW() - Mean time between updates (MTBU) ).
			- For each feeds:
				- Check if the the given feed has some new news article (RSS FEED'S latest article timestamp > lastupdatetime).
				- If updated, update MTBU, lastrequesttime, lastupdatetime else update lastrequesttime only.
						MTBU = Average time interval at which a news story is added on that feed.
				- make a insert query in articles table with url, articleJson, and ts_vector(article_title + article_content).
				- select roomid, rawjson, url from rooms and articles table where terms lexemes match the room name.
				- For each result:
					- Construct a thread with title, url, description from articles and post it into relevent rooms.
			- Invoke this job every hour.
*/


const performReadQuery = promisify(pg.read.bind(pg, config.connStr));
const performWriteQuery = promisify(pg.write.bind(pg, config.connStr));
const parseFeed = promisify(feedParser.bind(feedParser));

type Article = {
	title: string;
	link: string;
	content: string;
	published: Date;
}

type FeedsObject = {
	url: string;
	mtbu: number;
	lastrequesttime: number;
	lastupdatetime: number
};

type RoomSpecificNews = {
	roomid: string;
	roomname: string;
	article: Object;
	url: string
};

function articleAge (articlePubDate: number): number {
	return Date.now() - articlePubDate;
}

function buildThreads (latestNewsForRooms: Array<RoomSpecificNews>): Thread {
	const changes = {
		entities: {}
	};
	for (const newsArticle of latestNewsForRooms) {
		const id = uuid.v4();
		changes.entities[id] = {
			id,
			type: TYPE_THREAD,
			name: newsArticle.article.title,
			body: newsArticle.article.link,
			tags: [ TAG_RSS_NEWS_SEED ],
			parents: [ newsArticle.roomid ],
			identities: [],
			creator: 'belongbot',
			createTime: Date.now(),
		};
	}
	return changes;
}

function calculateMTBU (newArticles: Array<Article>): number {
	let sum = 0;
	const articleDatesTimeStamps = _.map(newArticles, (article) => {
		return (new Date(article.published)).getTime();
	});
	const sortedArticleTimeStamps = articleDatesTimeStamps.sort().reverse();
	const recentTimeStamps = sortedArticleTimeStamps.length >= 3 ? sortedArticleTimeStamps.slice(0, 3) : sortedArticleTimeStamps;
	recentTimeStamps.forEach((timestamp, index) => {
		if (index === 0) {
			sum += (Date.now() - timestamp);
		} else {
			sum += (recentTimeStamps[index - 1] - timestamp);
		}
	});
	return sum / (recentTimeStamps.length);
}

function filterFeeds (): Promise<Array<FeedsObject>> {
	return performReadQuery({
		$: 'SELECT * FROM feeds WHERE lastrequesttime < (extract(epoch from NOW()) * 1000 - mtbu)'
	});
}

function getRoomSpecificNews (): Promise<Array<RoomSpecificNews>> {
	return performReadQuery({
		$: `SELECT rooms.id as roomid, rooms.name as roomname, articles.rawjson as article, articles.url as url 
			From rooms, articles
			WHERE articles.terms @@ plainto_tsquery(rooms.name)`
	});
}

function getMostRecentNewsForRoom (roomSpecificNewsArticles: Array<RoomSpecificNews>): Array<RoomSpecificNews> {
	const sortedNewsArticles = _.orderBy(roomSpecificNewsArticles, (thread) => {
		return thread.article.published;
	}, [ 'desc' ]);
	return _.uniqBy(sortedNewsArticles, 'roomid');
}

function hasNewNewsArticle (articlePubDate: number, lastupdatetime: number): boolean {
	return articlePubDate > lastupdatetime;
}

function insertIntoFeeds (url: string): Promise<Array<{ rowCount: number }>> {
	return performWriteQuery([ {
		$: `INSERT INTO feeds (
			url, mtbu, lastrequesttime, lastupdatetime
		) VALUES (
			&{url}, &{mtbu}, &{lastrequesttime}, &{lastupdatetime} 
		)`,
		url,
		mtbu: 1,
		lastrequesttime: Date.now() - (8 * 24 * 60 * 60 * 1000),
		lastupdatetime: Date.now() - (8 * 24 * 60 * 60 * 1000)
	} ]);
}

function insertNewArticles (url: string, article: Object, contentForLexemes: string): Promise<Array<{ rowCount: number }>> {
	return performWriteQuery([ {
		$: `INSERT INTO articles (
			url, rawjson, terms
		) VALUES (
			&{url}, &{rawjson}, to_tsvector(&{contentForLexemes}) 
		)`,
		url,
		rawjson: JSON.stringify(article),
		contentForLexemes
	} ]);
}

function parseNewsFeed (url: string): Promise<Article> {
	return parseFeed(url);
}

function truncateArticlesTable (): Promise<any> {
	return performReadQuery({
		$: 'TRUNCATE TABLE articles'
	});
}

function updateFeedsOnNewArticles (lastupdatetime: number, url: string, mtbu: number): Promise<Array<{ rowCount: number }>> {
	return performWriteQuery([ {
		$: `UPDATE feeds SET lastrequesttime = extract(epoch from NOW()) * 1000,
			lastupdatetime = &{lastupdatetime}, mtbu = &{mtbu} 
			WHERE url=&{url}`,
		lastupdatetime,
		url,
		mtbu
	} ]);
}

function updateFeedsOnNoNewArtcles (url: string): Promise<Array<{ rowCount: number }>> {
	return performWriteQuery([ {
		$: 'UPDATE feeds SET lastrequesttime = extract(epoch from NOW()) * 1000 WHERE url=&{url}',
		url
	} ]);
}

export const newsAggregator = (): Promise<Array<any>> => {
	// Check if the feeds table is not empty.
	return performReadQuery({
		$: 'SELECT url FROM feeds',
	})
	.then((results) => {
		// results: [{url: _}, ...]
		if (results.length === 0) {
			winston.info('feeds table is empty');
			// insert seed url if feeds table is empty
			const seedUrl = 'http://bangalore.citizenmatters.in/rss';
			return insertIntoFeeds(seedUrl);
		}
		return [ { rowCount: 0 } ];
	})
	.then(async (response) => {
		// response: [{.., rowCount: _, ...}, ..]
		if (response[0].rowCount === 1) {
			winston.info('Insert operation performed successfully.');
		}
		await truncateArticlesTable();
		// feeds: [{url: _, mtbu: _, lastrequesttime: _, lastupdatetime: _}, .....]
		const feeds = await filterFeeds();
		if (feeds.length > 0) {
			const parseFeedPromises = [];
			for (const feed of feeds) {
				/*
					CHECK FOR NEW ARTICLES:
						- checks:
							-> shouldn't be older than 1 week.
							-> Avoid duplicate stroies from the same feed.
							-> To avoid duplicate stories, compare article's pubdate with the lastupdatetime for that feed.
				*/
				const newArticles = [];
				let latestArticleDate = feed.lastupdatetime;
				parseFeedPromises.push(
					parseNewsFeed(feed.url)
					.then((newsArticles) => {
						const promises = [];
						for (const newsArticle of newsArticles) {
							const articlePubDate = (new Date(newsArticle.published)).getTime();
							const sevenDays = 7 * 24 * 60 * 60 * 1000;
							if (hasNewNewsArticle(articlePubDate, feed.lastupdatetime) && articleAge(articlePubDate) <= sevenDays) {
								latestArticleDate = Math.max(articlePubDate, latestArticleDate);
								const article = _.pick(newsArticle, [ 'title', 'link', 'content', 'published' ]);
								newArticles.push(article);
							}
						}

						if (newArticles.length > 0) {
							const mtbu = calculateMTBU(newArticles);
							// update MTBU, lastrequesttime, lastupdatetime
							promises.push(
								updateFeedsOnNewArticles(latestArticleDate, feed.url, mtbu)
							);

							// Insert new articles
							for (const article of newArticles) {
								const url = article.link;
								const articleObj = article;
								const contentForLexemes = article.title + ' ' + article.content;
								promises.push(
									insertNewArticles(url, articleObj, contentForLexemes)
								);
							}
						} else {
							// update lastrequesttime
							promises.push(
								updateFeedsOnNoNewArtcles(feed.url)
							);
						}

						return Promise.all(promises);
					})
				);
			}
			await Promise.all(parseFeedPromises);
			const roomSpecificNewsArticles = await getRoomSpecificNews();
			return roomSpecificNewsArticles;
		}
		return feeds;
	});
};


// Invoke this job every hour
setInterval(async () => {
	try {
		const roomSpecificNewsArticles = await newsAggregator();
		if (roomSpecificNewsArticles.length > 0) {
			const latestNewsForRooms = getMostRecentNewsForRoom(roomSpecificNewsArticles);
			const threads = buildThreads(latestNewsForRooms);
			bus.emit('change', threads);
		} else {
			winston.info('No new news stories found !!');
		}
	} catch (e) {
		winston.error(`somethong went wrong while aggregating news, ${e}`);
	}
}, 3600000);
