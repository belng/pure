/* flow */
/* eslint-disable no-console, array-callback-return */

import feedParser from 'feed-read';
import { bus, config } from '../../core-server';
import winston from 'winston';
import * as pg from '../../lib/pg';
import promisify from '../../lib/promisify';
import uuid from 'node-uuid';
import { TYPE_THREAD, TAG_POST_NEWS_SEED, TAG_ROOM_META } from '../../lib/Constants';
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
			- BOTNEWS
				column                   type
			  -----------------------------------------
			    title		             text
		        url                 	 text
				roomid    		         text
				roomname 				 text
				createtime				 bigint

		- ALGORITHM:
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


const JOB_INVOCATION_INTERVAL = 60 * 60 * 1000;
const ALLOWED_ARTICLE_AGE = 7 * 24 * 60 * 60 * 1000;
const ALLOWED_TRACKING_TIME = 24 * 60 * 60 * 1000;
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
	rawjson: Article;
	url: string
};


async function getFilteredNewsForRooms(latestNewsForRooms: Array<RoomSpecificNews>): Array<RoomSpecificNews> {
	const postedNews = await performReadQuery({
		$: 'SELECT roomid, url FROM botnews'
	});
	return latestNewsForRooms.filter((newsArticle) => {
		for (const news of postedNews) {
			if (news.url === newsArticle.url && news.roomid === newsArticle.roomid) {
				winston.info('Dupliacte news story is found !!');
				return false;
			}
		}
		return true;
	});
}

async function buildThreads (latestNewsForRooms: Array<RoomSpecificNews>): Thread {
	const filteredNewsForRooms = await getFilteredNewsForRooms(latestNewsForRooms);
	if (filteredNewsForRooms.length === 0) {
		winston.info('All News story were posted already, rollback !!');
		return null;
	}
	let timeStamp = Date.now();
	const changes = {
		entities: {}
	};
	winston.info('Inserting into botnews and building threads');
	const query = 'INSERT INTO botnews (title, url, roomid, roomname, createtime) VALUES';
	const values = [];
	for (const newsArticle of filteredNewsForRooms) {
		const id = uuid.v4();
		const createTime = timeStamp++;
		values.push({
			$: '(&{title}, &{url}, &{roomId}, &{roomName}, &{createTime})',
			title: newsArticle.rawjson.title,
			url: newsArticle.url,
			roomId: newsArticle.roomid,
			roomName: newsArticle.roomname,
			createTime
		});
		changes.entities[id] = {
			id,
			type: TYPE_THREAD,
			name: newsArticle.rawjson.title,
			body: newsArticle.url,
			tags: [ TAG_POST_NEWS_SEED ],
			parents: [ newsArticle.roomid ],
			identities: [],
			creator: 'belongbot',
			createTime
		};
	}
	const finalQuery = pg.cat([ query, pg.cat(values, ', ') ], '');
	await Promise.all([
		performWriteQuery([ finalQuery ]),
		performWriteQuery([ {
			$: 'delete from botnews where createtime > &{ALLOWED_TRACKING_TIME}',
			ALLOWED_TRACKING_TIME
		} ])
	]);
	winston.info('Successfully inserted latest news into botnews table !');
	return changes;
}

function getDueFeeds (): Promise<Array<FeedsObject>> {
	return performReadQuery({
		$: 'SELECT * FROM feeds WHERE lastrequesttime < (extract(epoch from NOW()) * 1000 - mtbu)'
	});
}

function getRoomSpecificNews (): Promise<Array<RoomSpecificNews>> {
	return performReadQuery({
		$: `SELECT rooms.id as roomid, rooms.name as roomname, article.rawjson as rawjson, article.url as url FROM rooms 
			JOIN LATERAL (
				SELECT * FROM articles
	   			WHERE articles.terms @@ plainto_tsquery(rooms.name) AND rooms.tags <> &{metaRoom}
	   			ORDER  BY articles.rawjson->>'published' DESC NULLS LAST LIMIT  1
			) article ON TRUE`,
		metaRoom: `{${TAG_ROOM_META}}`
	});
}

function insertNewArticles (articles: Array<Article>): Promise<Array<{ rowCount: number }>> {
	const query = 'INSERT INTO articles (url, rawjson, terms) VALUES';
	const values = [];
	articles.forEach(article => {
		values.push({
			$: '(&{url}, &{rawjson}, to_tsvector(&{contentForLexemes}))',
			url: article.link,
			rawjson: JSON.stringify(article),
			contentForLexemes: article.title + ' ' + article.content
		});
	});
	const finalQuery = pg.cat([ query, pg.cat(values, ', ') ], '');
	return performWriteQuery([ finalQuery ]);
}

function updateFeedsOnNewArticles (lastupdatetime: number, url: string, newArticlesCount: number): Promise<Array<{ rowCount: number }>> {
	return performWriteQuery([ {
		$: `UPDATE feeds SET lastrequesttime = extract(epoch from NOW()) * 1000,
			lastupdatetime = &{lastupdatetime}, mtbu = &{mtbu} 
			WHERE url=&{url}`,
		lastupdatetime,
		url,
		mtbu: (Date.now() - lastupdatetime) / newArticlesCount
	} ]);
}

function updateFeedsOnNoNewArtcles (url: string): Promise<Array<{ rowCount: number }>> {
	return performWriteQuery([ {
		$: 'UPDATE feeds SET lastrequesttime = extract(epoch from NOW()) * 1000 WHERE url=&{url}',
		url
	} ]);
}

export const newsAggregator = async () => {
	await performWriteQuery([ {
		$: 'TRUNCATE TABLE articles'
	} ]);
	// feeds: [{url: _, mtbu: _, lastrequesttime: _, lastupdatetime: _}, .....]
	const feeds = await getDueFeeds();
	await Promise.all(feeds.map(async feed => {
		try {
			winston.info(`parsing feed with url: ${feed.url}`);
			const newsArticles = await parseFeed(feed.url);
			/*
				CHECK FOR NEW ARTICLES:
					- checks:
						-> shouldn't be older than 1 week.
						-> Avoid duplicate stroies from the same feed.
						-> To avoid duplicate stories, compare article's pubdate with the lastupdatetime for that feed.
			*/
			let latestArticleDate = feed.lastupdatetime;
			const newNewsArticles = newsArticles.filter(newsArticle => {
				const articlePubDate = (new Date(newsArticle.published)).getTime();
				const articleAge = Date.now() - articlePubDate;
				const hasNewNewsArticle = articlePubDate > feed.lastupdatetime;
				latestArticleDate = Math.max(articlePubDate, latestArticleDate);
				return hasNewNewsArticle && articleAge <= ALLOWED_ARTICLE_AGE;
			});
			if (newNewsArticles.length > 0) {
				await Promise.all([
					updateFeedsOnNewArticles(latestArticleDate, feed.url, newNewsArticles.length),
					insertNewArticles(newNewsArticles)
				]);
			} else {
				await updateFeedsOnNoNewArtcles(feed.url);
			}
		} catch (e) {
			winston.warn(`Error while parsing ${feed.url}: ${e}`);
		}
	}));
};

export const postThreads = async () => {
	try {
		await newsAggregator();
		const roomSpecificNewsArticles = await getRoomSpecificNews();
		if (roomSpecificNewsArticles.length > 0) {
			const threads = await buildThreads(roomSpecificNewsArticles);
			winston.info(threads);
			if (threads) {
				bus.emit('change', threads);
			}
		} else {
			winston.info('No new news stories found !!');
		}
	} catch (e) {
		winston.warn(`somethong went wrong while aggregating news, ${e}`);
	}
};

// Invoke this job every hour
setInterval(postThreads, JOB_INVOCATION_INTERVAL);
