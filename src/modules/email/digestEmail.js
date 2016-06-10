/* eslint max-nested-callbacks: 0 */
import getMailObj from './buildMailObj';
import { config } from '../../core-server';
import * as Constants from '../../lib/Constants';
import log from 'winston';
import fs from 'fs';
import handlebars from 'handlebars';
import * as pg from '../../lib/pg';
import jwt from 'jsonwebtoken';
import send from './sendEmail';
import Counter from '../../lib/counter';
const DIGEST_INTERVAL = 60 * 60 * 1000, DIGEST_DELAY = 24 * 60 * 60 * 1000,
	template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/' + config.app_id + '.digest.hbs', 'utf-8').toString()),
	connStr = config.connStr, conf = config.email, counter1 = new Counter();
let i = 0;
let lastEmailSent, end;
const fields = [
		'roomrels.presencetime', 'users.name', 'threads.counts->>\'children\' children', 'users.identities', 'users.id userid', 'threads.score', 'threads.name threadtitle', 'threads.createtime', 'threads.id threadid', 'rooms.name roomname', 'rooms.id roomid'
	], joins = [
		'users', 'roomrels', 'threads', 'rooms'
	], conditions = [
		'users.id=roomrels.user', 'threads.parents[1]=roomrels.item', 'roomrels.item=rooms.id', 'threads.createtime > extract(epoch from now()-interval \'2 months\')*1000', 'threads.score is not null', 'users.params->> \'email\' <> \'{"frequency": "never", "notifications": false}\'', 'roles @> \'{3}\'', 'roomrels.presencetime >= &{start}', 'roomrels.presencetime < &{end}', 'timezone >= &{min}', 'timezone < &{max}'
	]; // where threads.createtime > urel.ptime
const query = pg.cat(
		[ 'SELECT ', pg.cat(fields, ', '), 'FROM ', pg.cat(joins, ', '), 'WHERE ', pg.cat(conditions, ' AND ') ]
	).$ + 'order by users.id';

function getSubject() {
	// const counts = rels.length - 1;
	// const heading = '[' + rels[0].room + '] ' + rels[0].threads[0].threadTitle + ' +' + counts + ' more';
	const heading = 'Updates from ' + config.app_name;
	return heading;
}

export function initMailSending (userRel) {
	// console.log("init mio djf: ", userRel)
	// console.log("counter1.pending: ", counter1.pending)
	const user = userRel.currentUser;
	if (!user.identities || !Array.isArray(user.identities)) {
		log.info('No identities found for user: ', user);
		return;
	}
	const	rels = userRel.currentRels.splice(0, 4),
		mailIds = user.identities.filter((el) => {
			return /mailto:/.test(el);
		});
		// for (const i in rels) {
		// 	if(rels[i].threads.length > 4) {
		// 		rels[i].threads = rels[i].threads.splice(0, 4);
		// 	}
		// }
		// console.log("rels[0].threads.length: ", rels[0].threads.length)

		// console.log("rels[0].threads: ", rels)
	mailIds.forEach((mailId) => {
		counter1.inc();
		const emailAdd = mailId.slice(7),
			emailHtml = template({
				token: jwt.sign({ email: emailAdd }, conf.secret, { expiresIn: '5 days' }),
				domain: config.server.protocol + '//' + config.server.host + ':' + config.server.port,
				rooms: rels,
			}),
			emailSub = getSubject(rels);
			console.log('Digest email to: ', emailAdd)

		send(conf.from, /*emailAdd*/'ja.chandrakan@gmai.com', emailSub, emailHtml, (e) => {
			if (!e) {
				log.info('Digest email successfully sent');
				counter1.dec();
				// console.log('counter1.pending: ',counter1.pending)
			}
		});
	});
	counter1.then(() => {
		log.info('successfully updated jobs for digest email');
		// pg.write(connStr, [ {
		// 	$: 'UPDATE jobs SET lastrun=&{end} WHERE id=&{jid}',
		// 	end,
		// 	jid: Constants.JOB_EMAIL_DIGEST,
		// } ], (error) => {
		// 	if (!error) log.info('successfully updated jobs for digest email');
		// });
	});
}

function sendDigestEmail () {
	log.info('Starting digest email');
	const startPoint = Date.now() - 2 * DIGEST_DELAY,

		end = Date.now() - DIGEST_DELAY;
	let	start = lastEmailSent < startPoint ? lastEmailSent : startPoint;

	function getTimezone(hour) {
		const UtcHrs = new Date().getUTCHours(),
			c = UtcHrs > 12 ? 24 - UtcHrs : UtcHrs,
			d = hour - c,
			tz = d * 60,
			tzMin = tz - 30,
			tzMax = tz + 30;

		return { min: 300, max: 500 };
	}

	const timeZone = getTimezone(conf.digestEmailTime);

	log.info('timezone: ', timeZone);
	// if (conf.debug) {
	// 	start = 0; end = Date.now(); /* tz.min = 0; tz.max = 1000; */
	// }

	pg.readStream(config.connStr, {
		$: query,
		start,
		end,
		min: timeZone.min,
		max: timeZone.max,
	}).on('row', (urel) => {
	// console.log('Got user for digest email: ', urel.userid);
		if (urel.userid === 'vicky41296') {
			console.log('urel: ', urel)
			console.log(i++)
		}

		const emailObj = getMailObj(urel) || {};

		if (Object.keys(emailObj).length !== 0) {
			// console.log('send email now: ', emailObj);
			initMailSending(emailObj);
		}
	}).on('end', () => {
		const c = getMailObj({});
		console.log('got c: ', c)
		initMailSending(c);
		log.info('ended digest email');
	});
}

export default function (row) {
	lastEmailSent = row.lastrun;
	const UtcMnts = new Date().getUTCMinutes(),
		delay = UtcMnts < 30 ? 30 : 90,
		after = conf.debug ? 0 : (delay - UtcMnts) * 60000;

	function mtns(millis) {
		  const minutes = Math.floor(millis / 60000),
			seconds = ((millis % 60000) / 1000).toFixed(0);
		  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
	}

	log.info('Digest email will be sent after ', mtns(after), 'minutes');
	setTimeout(() => {
		sendDigestEmail();
		setInterval(sendDigestEmail, DIGEST_INTERVAL);
	}, after);
}
