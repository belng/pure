import Logger from '../../lib/logger';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import * as pg from '../../lib/pg';
import send from './sendEmail';
import { config } from '../../core-server';
import * as Constants from '../../lib/Constants';
const log = new Logger(__filename, 'welcome');
const WELCOME_INTERVAL = 5 * 60 * 1000, WELCOME_DELAY = 5 * 60 * 1000, connStr = config.connStr, conf = config.email,
	template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/' +
	config.app_id + '.welcome.hbs', 'utf-8').toString());

let lastEmailSent, end;

function initMailSending(user) {
	log.debug(user);
	if (!user.identities || !Array.isArray(user.identities)) {
		log.info('No identities found for user: ', user);
		return;
	}
	const mailIds = user.identities.filter((el) => {
			return el.startsWith('mailto:');
	});
	mailIds.forEach((mailId) => {
		const emailAdd = mailId.slice(7);
		log.info('Sending email to:', emailAdd);
		const emailHtml = template({
			user: user.name || user.id,
			domain: config.server.protocol + '//' + config.server.host + ':' + config.server.port,
			token: jwt.sign({ email: emailAdd }, conf.secret, { expiresIn: '2 days' }),
		});

		send(conf.from, emailAdd, 'Welcome to ' + config.app_name, emailHtml, e => {
			if (e) {
				log.error('Error in sending email');
			}
		});
	});
}

function sendWelcomeEmail () {
	end = Date.now() - /* 10000 */ WELCOME_DELAY;

	if (conf.debug) {
		log.info('debug is enabled');
		lastEmailSent = 0;
		end = Date.now();
	}
	pg.readStream(connStr, {
		$: 'SELECT id, name, identities FROM users WHERE createtime > &{start} AND createtime <= &{end}',
		start: lastEmailSent,
		end,
	}).on('row', user => {
		log.info('Got a new user: ', user.id);
		initMailSending(user);
	}).on('end', () => {
		log.info('ended Welcome email');
		pg.write(connStr, [{
			$: 'UPDATE jobs SET lastrun=&{end} WHERE id=&{jid}',
			end,
			jid: Constants.JOB_EMAIL_WELCOME,
		}], (error) => {
			lastEmailSent = end;
			if (!error) log.info('successfully updated jobs for welcome email');
		});
	});
}

export default function (row) {
	lastEmailSent = row.lastrun;
	log.info('starting welcome email', 'last sent: ', lastEmailSent);
	sendWelcomeEmail();
	setInterval(sendWelcomeEmail, /* 10000 */ WELCOME_INTERVAL);
}
