/* eslint max-nested-callbacks: 0 */
/* eslint quotes: 0*/
import { Constants, config } from '../../core-server';
import Counter from '../../lib/counter';
import log from 'winston';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import * as pg from '../../lib/pg';
import send from './sendEmail';
import handlebars from 'handlebars';
import getMailObj from './buildMailObj';
const MENTION_INTERVAL = 10 * 60 * 1000, MENTION_DELAY = 10 * 60 * 1000,
	template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/' + config.app_id + '.digest.hbs', 'utf-8').toString()),
	connStr = config.connStr, conf = config.email, counter1 = new Counter();

let lastEmailSent, end;

function initMailSending (userRel) {
	counter1.inc();
	// console.log('counter1.pending: ', counter1.pending)
	const user = userRel.currentUser,
		rels = userRel.currentRels,
		emailAdd = user.identities[0].slice(7),
		emailHtml = template({
			token: jwt.sign({ email: emailAdd }, conf.secret, { expiresIn: '5 days' }),
			domain: conf.domain,
			rooms: rels
		}),
		emailSub = `You h've been mentioned`;

	send(conf.from, emailAdd, emailSub, emailHtml, (e) => {
		if (!e) {
			log.info('Mention email successfully sent');
			counter1.dec();
			// console.log('counter1.pending: ',counter1.pending)
			counter1.then(() => {
				pg.write(connStr, [ {
					$: 'UPDATE jobs SET lastrun=&{end} WHERE id=&{jid}',
					end,
					jid: Constants.JOB_EMAIL_MENTION
				} ], (error) => {
					if (!error) log.info('successfully updated jobs for mention email');
				});
			});
		}
	});
}

function sendMentionEmail() {
	const start = lastEmailSent,
		counter = new Counter();

	let row = false;

	end = Date.now() - MENTION_DELAY;

	pg.readStream(connStr, {
		$: `with textrel as (select * from textrels join users on "user"=id where roletime>users.presencetime and roles @> '{2}' and roletime >= &{start} and roletime < &{end}) select * from textrel join texts on textrel.item=texts.id order by textrel.user`,
		mention: Constants.ROLE_MENTIONED,
		start,
		end,
	}).on('row', (urel) => {
		row = true;
		// console.log(urel.user)
		counter.inc();
		pg.read(connStr, {
			$: `select * from rooms where id=&{id} `, // and presencetime<&{roletime}
			id: urel.parents[1]
		}, (err, room) => {
			if (err) throw err;
			urel.roomName = room[0].name;
			const emailObj = getMailObj(urel) || {};

			if (Object.keys(emailObj).length !== 0) {
				initMailSending(emailObj);
			}
			counter.dec();
			counter.then(() => {
				const c = getMailObj({});

				initMailSending(c);
			});
		});
	}).on('end', () => {
		if (!row) {
			log.info('Did not get eny user');
		}
		log.info('ended');
	});

}

export default function (row) {
	lastEmailSent = row.lastrun;
	sendMentionEmail();
	setInterval(sendMentionEmail, MENTION_INTERVAL);
}
