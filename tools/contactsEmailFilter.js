/* eslint-disable no-console, no-param-reassign */

import * as pg from '../src/lib/pg';
import BulkEmailChecker from '../src/lib/BulkEmailChecker';
import winston from 'winston';
import promisify from '../src/lib/promisify';
import contactsFilterConfig from './tools-config/contactsFilterConfig';
import { config } from '../src/core-server';

const LIMIT_CONTACT_TO = contactsFilterConfig.limitContactTo;
const JOB_INVOCATION_INTERVAL = contactsFilterConfig.jobInvocationInterval;
const performReadQuery = promisify(pg.read.bind(pg, config.connStr));
const performWriteQuery = promisify(pg.write.bind(pg, config.connStr));

const verifyMails = async () => {
	const validMails = [];
	const invalidMails = [];
	const unsureMails = [];
	const bec = new BulkEmailChecker();

	const contacts = await performReadQuery({
		$: `SELECT contact->>'email' AS email FROM contacts
			WHERE (contact->>'email') IS NOT NULL AND lastmailverifytime IS NULL LIMIT &{LIMIT_CONTACT_TO}`,
		LIMIT_CONTACT_TO
	});

	bec.on('data', data => {
		if (data.isValid === true && !validMails.indexOf(data.email) > -1) {
			validMails.push(data.email);
		} else if (data.isValid === false && !invalidMails.indexOf(data.email) > -1) {
			invalidMails.push(data.email);
		} else if (data.isValid === 'unsure' && !unsureMails.indexOf(data.email) > -1) {
			unsureMails.push(data.email);
		}
	});

	bec.on('error', error => winston.info(error));

	bec.on('end', async () => {
		const now = Date.now();
		await performWriteQuery([
			{
				$: `UPDATE contacts SET valid='true', lastmailverifytime = &{now} WHERE
					(contact->>'email') IS NOT NULL AND contact->>'email' IN (&(validMails));`,
				now,
				validMails,
			},
			{
				$: `UPDATE contacts SET valid='true', lastmailverifytime = &{now} WHERE
					(contact->>'email') IS NOT NULL AND contact->>'email' IN (&(invalidMails));`,
				now,
				invalidMails,
			},
			{
				$: `UPDATE contacts SET valid='true', lastmailverifytime = &{now} WHERE
					(contact->>'email') IS NOT NULL AND contact->>'email' IN (&(unsureMails));`,
				now,
				unsureMails,
			}
		]);
	});

	for (const contact of contacts) {
		bec.add(contact.email);
	}
	bec.done();
};

setInterval(verifyMails, JOB_INVOCATION_INTERVAL);
