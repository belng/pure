/* eslint max-nested-callbacks: 0 */
// import getMailObj from './buildMailObj';
import { config } from '../../core-server';
import * as Constants from '../../lib/Constants';
import Logger from '../../lib/logger';
import fs from 'fs';
import handlebars from 'handlebars';
import * as pg from '../../lib/pg';
import jwt from 'jsonwebtoken';
import send from './sendEmail';
import Counter from '../../lib/counter';
const DIGEST_INTERVAL = 60 * 60 * 1000, /*DIGEST_DELAY = 24 * 60 * 60 * 1000,*/
	template = handlebars.compile(
		fs.readFileSync(__dirname + '/../../../templates/' + config.app_id + '.digest.hbs', 'utf-8').toString()
	),
	connStr = config.connStr, conf = config.email, counter1 = new Counter(), log = new Logger(__filename);
let lastEmailSent, /*end,*/ i = 0;
const fields = [
		'users.name',
		'CAST(coalesce(rooms.counts ->> \'follower\' , \'0\') as integer) follower',
		'threads.counts->>\'children\' children',
		'users.identities', 'users.id userid',
		'threads.score', 'threads.name threadtitle',
		'threads.creator','threads.body',
		'threads.meta->\'photo\'->>\'thumbnail_url\' photo',
		'threads.counts->>\'upvote\' upvote',
		'threads.createtime', 'threads.id threadid', 'rooms.name roomname',
		'rooms.id roomid'
	], joins = [
		'users',
		'roomrels',
		'threads',
		'rooms'
	], conditions = [
		'users.presencetime IS NOT NULL',
		'users.id ~ &{range}',
		'users.id=roomrels.user',
		'threads.parents[1]=roomrels.item',
		'(threads.counts->\'upvote\') IS NOT NULL',
		'CAST(coalesce(threads.counts ->> \'upvote\' , \'0\') as integer) > 5',
		'roomrels.item=rooms.id',
		'threads.counts IS NOT NULL',
		'CAST(coalesce(threads.counts ->> \'children\' , \'0\') as integer) > 10',
		'threads.createtime >= extract(epoch from now()-interval \'2 days\')*1000',
		'(users.params-> \'email\'->>\'frequency\' = \'daily\' OR (users.params->\'email\') is null)',
		'roles @> \'{3}\''
	],
	query = pg.cat(
		[
			'SELECT ', pg.cat(fields, ', '),
			'FROM ', pg.cat(joins, ', '),
			'WHERE ', pg.cat(conditions, ' AND '),
			'ORDER BY users.id, threads.score/CAST(coalesce(rooms.counts ->> \'follower\' , \'0\') as integer) desc'
		]
	);

function getSubject() {
	const heading = 'Updates from ' + config.app_name;
	return heading;
}

export function initMailSending (userRel) {
	// console.log(userRel)
	for (let i=0; i<userRel.length; i++) {
		if(i === 3) {
			userRel[i].indexFourth = true;
		}
		if (i < 3) {
			userRel[i].showBody = true;
		}
	}
	const user = {id: userRel[0].userid, identities: userRel[0].identities};
	if (!user.identities || !Array.isArray(user.identities)) {
		log.info('No identities found for user: ', user);
		return;
	}
	mailIds = user.identities.filter((el) => {
		return /mailto:/.test(el);
	});

	mailIds.forEach((mailId) => {
		counter1.inc();
		const emailAdd = mailId.slice(7),
		emailSub = getSubject(),
		date = Date.now();
		const templateObj = {
			token: jwt.sign({ email: emailAdd }, conf.secret, { expiresIn: '5 days' }),
			domain: config.server.protocol + '//' + config.server.host,
			link : '?utm_source=DailyDigest&utm_medium=Email&utm_term='+ encodeURIComponent(emailAdd) + '&utm_content=' + encodeURIComponent(emailSub) + '&utm_campaign=' + date,
			threads: userRel,
			email: emailAdd,
			sub: emailSub,
			date
		};
		const	emailHtml = template(templateObj);
		log.info('Digest email to: ', emailAdd);

		send(conf.from, emailAdd, emailSub, emailHtml, (e) => {
			if (!e) {
				log.info('Digest email successfully sent');
			}
			counter1.dec();
		});
	});
	counter1.then(() => {
		log.info('successfully updated jobs for digest email');
		pg.write(connStr, [ {
			$: 'UPDATE jobs SET lastrun=&{end} WHERE id=&{jid}',
			end: Date.now(),
			jid: Constants.JOB_EMAIL_DIGEST,
		} ], (error) => {
			if (!error) {
				log.info('successfully updated jobs for digest email');
				log.info('Digest email sent to ', i, ' users');
			}
		});
	});
}

function sendDigestEmail () {
	let range;
	const today = new Date().toString().split(" ")[2],
		lastEmailSentDay = new Date(parseInt(lastEmailSent, 10)).toString().split(" ")[2];
	//
	if(new Date().getUTCHours() !== 22) { //Send at 3am IST. Move this to config
		log.info('Not digest email time: ', new Date().getUTCHours());
		return;
	}

	//Do not send digest email multiple times in the same day
	// This to prevent if server restarts multiple times in single hour. (cron job)
	if ( today === lastEmailSentDay	) {
		log.info('Digest email has been sent today. Last email sent time is: ', new Date((parseInt(lastEmailSent, 10))));
		return;
	}

if (new Date().getDay() % 2 === 0) {
	range = '^[a-o]';
} else {
	range = '^[p-z]|^[0-9]';
}

	log.info('Starting digest email');
	query.range = range;
	let threadRels = [], previousUser;
	pg.readStream(config.connStr, query).on('row', (threadRel) => {
		log.info('threadRel.userid: ', threadRel.userid, previousUser)
		if(threadRel.userid !== previousUser && threadRels.length > 0) {
			log.info('sending to user: ', previousUser);
			++i;
			initMailSending(threadRels);
			threadRels = [];
		}
		threadRels.push(threadRel);
		previousUser = threadRel.userid;
	}).on('end', () => {
		i++;
		log.info('Sending to last user: ', previousUser, threadRels);

		initMailSending(threadRels);
		log.info('ended digest email');
		conf.sendConfirmEmailTo.forEach(email => {
				send(conf.from, email, 'No. of Daily mails to Belong Users',
				'Today Digest email has been sent to '+ i +' users',
				e => {
				if (!e) {
					log.info('Confirmation email successfully sent');
				}
			});
		});
	});
}

export default function (row: Object) {
	lastEmailSent = row.lastrun;
	// const UtcMnts = new Date().getUTCMinutes(),
	// 	delay = UtcMnts < 30 ? 30 : 90,
	// 	after = conf.debug ? 0 : (delay - UtcMnts) * 60000;

	// function mtns(millis) {
	// 	  const minutes = Math.floor(millis / 60000),
	// 		seconds = ((millis % 60000) / 1000).toFixed(0);
	// 	  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
	// }
	//
	// log.info('Digest email will be sent after ', mtns(after), 'minutes');
	setTimeout(() => {
		sendDigestEmail();
		setInterval(sendDigestEmail, DIGEST_INTERVAL);
	});
}
