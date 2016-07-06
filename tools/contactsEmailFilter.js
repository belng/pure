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
	const emailContactMap = {};
	const verifiedMails = {};
	const bulkUpdateQuery = [];
	const bec = new BulkEmailChecker();

	const contacts = await performReadQuery({
		$: `SELECT contact::text AS contacttext, contact->>'email' AS email FROM contacts
			WHERE contact ? 'email' AND lastmailverifytime IS NULL LIMIT &{LIMIT_CONTACT_TO}`,
		LIMIT_CONTACT_TO
	});

	bec.on('data', async data => {
		if (!verifiedMails[data.email]) {
			verifiedMails[data.email] = data.isValid;
		}
	});

	bec.on('error', error => winston.info(error));

	bec.on('end', async () => {
		let now = Date.now();
		for (const email in verifiedMails) {
			for (const contactText of emailContactMap[email]) {
				const timeStamp = now++;
				bulkUpdateQuery.push({
					$: `UPDATE contacts SET valid = &{valid}::text, lastmailverifytime = &{timeStamp}
						WHERE contact::text = &{contactText}`,
					valid: verifiedMails[email],
					timeStamp,
					contactText
				});
			}
		}
		await performWriteQuery(bulkUpdateQuery);
		winston.info(`updated ${bulkUpdateQuery.length} rows in contacts table`);
	});

	for (const contact of contacts) {
		if (!emailContactMap[contact.email]) {
			emailContactMap[contact.email] = [];
		}
		emailContactMap[contact.email].push(contact.contacttext);
		bec.add(contact.email);
	}
	bec.done();
};

setInterval(verifyMails, JOB_INVOCATION_INTERVAL);
