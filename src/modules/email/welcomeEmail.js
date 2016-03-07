import log from 'winston';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import * as pg from '../../lib/pg';
import send from './sendEmail.js';
import Counter from '../../lib/counter';
import { Constants, config } from '../../core-server';
const WELCOME_INTERVAL = 5 * 60 * 1000, WELCOME_DELAY = 5 * 60 * 1000, connStr = config.connStr, conf = config.email, counter = new Counter(),
	template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/' + config.app_id + '.welcome.hbs', 'utf-8').toString());

let lastEmailSent, end;

function initMailSending(cUserRel) {
	const user = cUserRel.user,
		rels = cUserRel.rels,
		emailAdd = user.identities[0].slice(7),
		emailHtml = template({
			user: user.id,
			rels,
			domain: conf.domain,
			token: jwt.sign({ email: emailAdd.substring(8, emailAdd.length) }, conf.secret, { expiresIn: '2 days' })
		});

	send(conf.from, emailAdd, 'Welcome to ' + conf.app_id, emailHtml, (e) => {
		counter.inc();
		if (!e) {
			log.info('Welcome email successfully sent');
			counter.dec();
			// console.log('counter1.pending: ',counter1.pending)
			counter.then(() => {
				pg.write(connStr, [ {
					$: 'UPDATE jobs SET lastrun=&{end} WHERE id=&{jid}',
					end,
					jid: Constants.JOB_EMAIL_WELCOME
				} ], (error) => {
					if (!error) log.info('successfully updated jobs for welcome email');
				});
			});
		}
	});
}

function sendWelcomeEmail () {
	end = Date.now() - /* 10000 */WELCOME_DELAY;

	if (conf.debug) {
		lastEmailSent = 0;
		end = Date.now();
	}
	pg.readStream(connStr, {
		$: `SELECT * FROM users WHERE NOT(tags @> '{10}') AND createtime >&{start} AND createtime <= &{end} `,
		guest: Constants.TAG_USER_GUEST,
		start: lastEmailSent,
		end
	}).on('row', (user) => {
		log.info('Got a new user: ', user.id);
		const userRel = {}, rels = [];

		userRel.user = user;

		pg.readStream(connStr, {
			$: `SELECT * FROM roomrels JOIN rooms ON item=id where \"user\" = &{user}`,
			user: user.id
		}).on('row', (rel) => {
			rels.push(rel);
		}).on('end', () => {
			userRel.rels = rels;
			log.info('sending email to user: ', userRel.user.id);
			initMailSending(userRel);
		});
	}).on('end', () => {
		log.info('ended');
	});
}

export default function (row) {
	lastEmailSent = row.lastrun;
	sendWelcomeEmail();
	setInterval(sendWelcomeEmail, /* 10000 */WELCOME_INTERVAL);
}
