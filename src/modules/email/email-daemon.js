/* @flow */

import * as pg from '../../lib/pg';
import winston from 'winston';
import { config, Constants } from '../../core-server';
import sendWelcomeEmail from './welcomeEmail';
import sendMentionEmail from './mentionEmail';
import sendDigestEmail from './digestEmail';
const conf = config.email, connString = config.connStr;

if (!conf.auth.user && !conf.auth.pass) {
	winston.info('Email module not enabled');
} else {
	winston.info('Email module ready.');
	pg.read(connString, {
		$: 'SELECT * FROM jobs WHERE id in (&(ids))',
		ids: [ Constants.JOB_EMAIL_WELCOME, Constants.JOB_EMAIL_MENTION, Constants.JOB_EMAIL_DIGEST ]
	}, (err, results) => {
		if (err) return;
		winston.info('Results: ', results);
		results.forEach((row) => {
			switch (row.id) {
			case Constants.JOB_EMAIL_WELCOME:
				sendWelcomeEmail(row);
				break;
			case Constants.JOB_EMAIL_MENTION:
				sendMentionEmail(row);
				break;
			case Constants.JOB_EMAIL_DIGEST:
				sendDigestEmail(row);
				break;
			default:
				winston.info('wrong job id');
				break;
			}
		});
	});
}
