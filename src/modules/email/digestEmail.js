/* eslint max-nested-callbacks: 0 */
/* eslint babel/no-await-in-loop: 0 */
import { config } from '../../core-server';
import Logger from '../../lib/logger';
import fs from 'fs';
import handlebars from 'handlebars';
import * as pg from '../../lib/pg';
import promisify from '../../lib/promisify';
import jwt from 'jsonwebtoken';
import send from './sendEmail';
const DIGEST_INTERVAL = 60 * 60 * 1000,
	template = handlebars.compile(
		fs.readFileSync(__dirname + '/../../../templates/' + config.app_id + '.digest.hbs', 'utf-8').toString()
	),
	connStr = config.connStr, conf = config.email;
let lastEmailSent, /*end,*/ log = new Logger(__filename, 'digest');
const readSync = promisify(pg.read.bind(pg, connStr));

export function initMailSending (userThreadRel) {
	return new Promise(async res => {
		const threads = userThreadRel.threadRels,
			user = userThreadRel.user;

		for (let i=0; i<threads.length; i++) {
			if(i === 3) {
				threads[i].indexFourth = true;
			}
			if (i < 3) {
				threads[i].showBody = true;
			}
		}

		if (!user.identities || !Array.isArray(user.identities)) {
			log.info('No identities found for user: ', user);
			res();
		}

		let mailIds = user.identities.filter((el) => {
			return /mailto:/.test(el);
		});
		if(mailIds.length === 0) res();
		const emailAdd = mailIds[0].slice(7),
		emailSub = threads[0].threadtitle;
		const date = new Date().getDate(),
			month = new Date().getMonth()+1,
			year = new Date().getFullYear();
		const formattedDate = date + '-' + month + '-' + year;
		const templateObj = {
			token: jwt.sign({ email: emailAdd }, conf.secret, { expiresIn: '5 days' }),
			domain: config.server.protocol + '//' + config.server.host,
			link : '?utm_source=DailyDigest&utm_medium=Email&utm_term='+ encodeURIComponent(user.id) + '&utm_content=' + encodeURIComponent(emailSub) + '&utm_campaign=' + encodeURIComponent(formattedDate),
			threads,
			email: emailAdd,
			sub: emailSub,
			date
		};
		const	emailHtml = template(templateObj);
		log.info('Digest email to: ', emailAdd);
		const sendMail = promisify(send.bind());
		try{
			await sendMail(conf.from, emailAdd, emailSub, emailHtml);
		} catch(e) {
			log.e(e);
		}
		res();
	});
}

async function sendDigestEmail () {
	const today = new Date().toString().split(" ")[2],
		lastEmailSentDay = new Date(parseInt(lastEmailSent, 10)).toString().split(" ")[2];

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
	log.info('Starting digest email');
	let range;

	if (new Date().getDay() % 2 === 0) {
		range = '^[a-o]';
	} else {
		range = '^[p-z]|^[0-9]';
	}
	const users = await readSync({
		$:`SELECT
				id, identities, name FROM users
				WHERE
					presencetime IS NOT NULL
					AND users.id ~ &{range}
					AND (users.params-> 'email'->>'frequency' = 'daily' OR (users.params->'email') IS NULL)`,
		range
	});

	async function getRels()  {
		for(let i=0; i< users.length; i++) {
			log.info('Getting rels of: ', users[i].id);
			let threadRels = await readSync({
				$: `SELECT * FROM (SELECT
					CAST(coalesce(rooms.counts ->> 'follower' , '0') as integer) follower, threads.counts->>'children' children, threads.score, threads.name threadtitle, threads.creator, threads.body, threads.meta->'photo'->>'thumbnail_url' photo, threads.score/(1+ 0.1*CAST(coalesce(rooms.counts ->> 'follower' , '0') as integer)) scoreperfollower, threads.counts->>'upvote' upvote, threads.createtime, threads.id threadid, rooms.name roomname, rooms.id roomid FROM  roomrels, threads, rooms
						WHERE
							roomrels.user=&{userid} AND threads.parents[1]=roomrels.item AND (threads.counts->'upvote') IS NOT NULL AND CAST(coalesce(threads.counts ->> 'upvote' , '0') as integer) > 1 AND roomrels.item=rooms.id AND threads.counts IS NOT NULL AND CAST(coalesce(threads.counts ->> 'children' , '0') as integer) > 5 AND threads.createtime >= extract(epoch from now()-interval '2 days')*1000 AND roles @> '{3}') as t WHERE creator NOT IN ('juhi', 'shreyaskutty', 'belong', 'belongbot')
							ORDER BY scoreperfollower DESC`,
				userid: users[i].id
			});
			threadRels.sort((a, b) => {
				return b.upvote - a.upvote;
			});
			threadRels = threadRels.slice(0, 8);
			log.info(/*threadRels,*/ 'Got threads: ', threadRels.length);
			await initMailSending({threadRels, user: users[i]});
		}
		log.info('ended digest email');
		conf.sendConfirmEmailTo.forEach(email => {
				send(conf.from, email, 'No. of Daily mails to Belong Users',
				'Today Digest email has been sent to '+ users.length +' users',
				e => {
				if (!e) {
					log.info('Confirmation email successfully sent');
				}
			});
		});
	}
	getRels();
}

export default function (row: Object) {
	lastEmailSent = row.lastrun;
	setTimeout(() => {
		sendDigestEmail();
		setInterval(sendDigestEmail, DIGEST_INTERVAL);
	});
}
