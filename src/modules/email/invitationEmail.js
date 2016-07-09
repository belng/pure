import Logger from '../../lib/logger';
import fs from 'fs';
import handlebars from 'handlebars';
import * as pg from '../../lib/pg';
import promisify from '../../lib/promisify';
import send from './sendEmail';
import juice from 'juice';
import { config, cache } from '../../core-server';
const log = new Logger(__filename);
const JOB_INVOCATION_INTERVAL = config.invitationEmail.interval;
const connStr = config.connStr;
const conf = config.email;
const getUserFromCacheAsync = promisify(cache.getEntity.bind(cache));
const template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/' + config.app_id + '.invite.hbs', 'utf-8').toString());

function getEntityByIdentity(identities, callback) {
	pg.read(connStr, {
		$: 'select *  from users where identities && &{identities}',
		identities,
	}, (err, results) => {
		if (err) {
			log.error(err.message);
			callback(err);
		} else {
			if (results.length > 0) {
				callback(null, true);
			} else {
				callback(null, false);
			}
		}
	});
}

const getEntityByIdentityAsync = promisify(getEntityByIdentity.bind(getEntityByIdentity));

const initMailSending = (invitee, inviterLocalityName, inviterName) => {
	const emailBody = template({
		referrer: (inviterName || '').split(' ')[0],
		inviterLocalityName,
	});
	const inlinedTemplate = juice(emailBody);
	send(conf.from, invitee.contact.email, `Introducing Belong: Referred by ${inviterName}`, inlinedTemplate, e => {
		if (e) {
			log.error('Error in sending email');
			return;
		}
		pg.write(connStr, [ {
			$: `UPDATE contacts SET lastmailtime = &{now} WHERE
				referrer = &{referrer} AND contact->>'email' = &{email}`,
			now: Date.now(),
			email: invitee.contact.email,
			referrer: invitee.referrer
		} ], (err, res) => {
			if (err) {
				log.error(err);
			} else {
				log.info(`successfully updated ${res[0].rowCount} row(s) the contacts table`);
			}
		});
	});
};

const sendInvitationEmail = () => {
	const date = new Date();
	// Do not send any mails between 8:30 pm (IST) and 6:30 am
	if (date.getUTCHours() < 1 || date.getUTCHours() > 15) {
		return;
	}
	pg.readStream(connStr, {
		$: `SELECT * FROM contacts WHERE contact->>'email' IS NOT NULL AND valid = 'true'
			AND lastmailtime IS NULL LIMIT &{limit}`,
		limit: config.invitationEmail.limit
	})
	.on('row', async invitee => {
		log.info(`starting invitation process for invitee with email ${invitee.contact.email}, referred by ${invitee.referrer}`);
		let inviterLocalityName;
		const user = await getUserFromCacheAsync(invitee.referrer);
		const userExists = await getEntityByIdentityAsync([ 'mailto:' + invitee.contact.email ]);
		if (userExists) {
			return;
		}
		pg.readStream(connStr, {
			$: `SELECT rooms.name AS roomname FROM rooms
				JOIN roomrels ON id = item WHERE "user" = &{user} AND rooms.tags @> '{22}'
				AND roomrels.roles <> '{}' LIMIT 1`,
			user: invitee.referrer
		})
		.on('row', ({ roomname }) => {
			log.info(`Found locality associated with inviter: ${roomname}`);
			inviterLocalityName = roomname;
		})
		.on('end', () => {
			log.info(`Sending invitation email to: ${invitee.contact.email}`);
			initMailSending(invitee, inviterLocalityName, user.name);
		});
	})
	.on('end', () => {
		log.info('invitation process finished !');
	});
};

export default function () {
	setInterval(sendInvitationEmail, JOB_INVOCATION_INTERVAL);
}
