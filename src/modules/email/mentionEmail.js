/* eslint max-nested-callbacks: 0 */
/* eslint quotes: 0*/
import { config } from '../../core-server';
import * as Constants from '../../lib/Constants';
import Logger from '../../lib/logger';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import * as pg from '../../lib/pg';
import send from './sendEmail';
import handlebars from 'handlebars';
const MENTION_INTERVAL = 60 * 60 * 1000, MENTION_DELAY = 60 * 60 * 1000,
	template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/' +
	config.app_id + '.mention.hbs', 'utf-8').toString()), log = new Logger(__filename, 'mention'),
	connStr = config.connStr, conf = config.email;

let lastEmailSent, end, i = 0;

function initMailSending (userRel) {
		const user = userRel.puser;
		log.info('Sending to : ', user, userRel.prels.length);
		if (!user.identities || !Array.isArray(user.identities)) {
			log.info('No identities found for user: ', user);
			return;
		}

		const rels = userRel.prels,
			mailIds = user.identities.filter((el) => {
				return el.startsWith('mailto:');
			});
			if(mailIds.length === 0) return;
		const emailAdd = mailIds[0].slice(7);
		const emailHtml = template({
				token: jwt.sign({ email: emailAdd }, conf.secret, { expiresIn: '5 days' }),
				domain: config.server.protocol + '//' + config.server.host,
				rooms: rels,
			});
		const emailSub = `You have been mentioned`;
		send(conf.from, emailAdd, emailSub, emailHtml, () => {
			log.info('Send complete');
		});
}
function sendMentionEmail() {
	let start = lastEmailSent;
	let row = false;
	end = Date.now() - MENTION_DELAY;

	if (conf.debug) {
		log.info('email debug is enabed');
		start = 0; end = Date.now();
	}
	let puser = {}, prels = [];
	pg.readStream(connStr, {
		$: `SELECT
				users.id, users.identities, threads.name tname, threads.id tid,
				threads.body tbody, threads.counts->>'upvote' upvote,
				texts.body textbody, threads.meta->'photo'->>'thumbnail_url' photo,
				threads.creator threadcreator, texts.creator textcreator, rooms.name rname, rooms.id rid
				FROM
					threadrels, textrels, users, threads, texts, rooms
					WHERE
						threadrels.roles @> '{2}' AND threadrels.createtime >= &{start} AND
						threadrels.createtime <&{end} AND threadrels.user=users.id AND
						threadrels.item=threads.id AND threads.parents[1]=rooms.id AND
						texts.parents[1]=threads.id AND textrels.roles @> '{2}' AND
						(users.params-> 'email'->>'notifications' = 'true' OR (users.params->'email') IS NULL) AND
						textrels.item=texts.id AND textrels.user=users.id
						ORDER BY
							users.id`,
		start,
		end
	}).on('row', async t => {
		row = true;
		log.info("Got user to send mention email: ", t);
		const date = new Date().getDate(),
			month = new Date().getMonth()+1,
			year = new Date().getFullYear();
 		const formattedDate = date + '-' + month + '-' + year;
		t.utm = '?utm_source=Belongmention&utm_medium=Email&utm_term='+ encodeURIComponent(t.tid) +
		'&utm_content=' + encodeURIComponent(t.id) + '&utm_campaign=' + encodeURIComponent(formattedDate);
		if(t.id !== puser.id && prels.length > 0) {
			const emailObj = {puser, prels};
			prels = [];
			i++;
			initMailSending(emailObj);
		}
		puser.id = t.id;
		puser.identities = t.identities;
		delete t.id;
		delete t.identities;
		prels.push(t);

	}).on('end', async () => {
		if (!row) {
			log.info('Did not get any user for mention email');
			return;
		}
		log.info('Sending meantion email to last user: ', puser);
		i++;
		initMailSending({puser, prels});
		log.info('ended');
		log.info('Mention email sent to ', i, ' users');
		pg.write(connStr, [ {
			$: 'UPDATE jobs SET lastrun=&{end} WHERE id=&{jid}',
			end,
			jid: Constants.JOB_EMAIL_MENTION,
		} ], (error) => {
			lastEmailSent = end;
			log.info('Mention email sent to ', i, ' users');
			if (!error) log.info('successfully updated jobs for mention email');
		});
	});

}

export default function (row: Object) {
	lastEmailSent = row.lastrun;
	log.info('starting mention email');
	sendMentionEmail();
	setInterval(sendMentionEmail, MENTION_INTERVAL);
}
