import Logger from '../../lib/logger';
import fs from 'fs';
import handlebars from 'handlebars';
import * as pg from '../../lib/pg';
import promisify from '../../lib/promisify';
import send from './sendEmail';
import juice from 'juice';
import { config } from '../../core-server';
const log = new Logger(__filename, 'invite');
const JOB_INVOCATION_INTERVAL = config.invitationEmail.interval;
const conf = config.email;
const readSync = promisify(pg.read.bind(pg, config.connStr));
const template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/' + config.app_id + '.invite.hbs', 'utf-8').toString());
const AlreadySent = [];

async function initMailSending(contacts, inviter) {
	let userRoom, message, inviterLocalityName;
	userRoom = await readSync({
		$: `SELECT
			users.id, users.name uname, rooms.name rname
			FROM
				users, rooms, roomrels
				WHERE
					users.id=&{id} AND rooms.id=item AND
					roomrels.user=&{id} AND rooms.tags @> '{22}' AND
					roomrels.roles<>'{}' LIMIT 1`,
		id: inviter
	});

	if (userRoom.length === 0) {
		userRoom.push({id: inviter, rname: 'Belong'});
		message = ` a neighborhood group on our platform `;
	} else {
		inviterLocalityName = userRoom[0].rname;
		message = ` the ${inviterLocalityName} neighborhood group `;
		log.info(`Found locality associated with inviter ${inviterLocalityName}`);
	}
	let userName = userRoom[0].uname || userRoom[0].id;
	log.info('refferer: ', userName);

	log.info('Got invitations to send: ', contacts, inviterLocalityName, userName);
	const emailBody = template({
		referrer: userName,
		message,
	});
	const inlinedTemplate = juice(emailBody);
	const sub = `Introducing Belong: Referred by ${userName}`;

	contacts.forEach(async invitee => {
		if (AlreadySent.includes(invitee)) {
			log.info('once invitation is sent ', AlreadySent, invitee);
			return;
		}
		AlreadySent.push(invitee);
		const userExists = await readSync({
			$: 'select *  from users where identities @> &{identities}',
			identities: [invitee]
		});

		if (userExists.length > 0) {
			log.info('This user exists or once invitation is sent ', userExists);
			return;
		}

		log.info(`Sending invitation email to: ${invitee}`);

		send(conf.from, invitee, sub, inlinedTemplate, e => {
			if (e) {
				log.error('Error in sending email');
				return;
			}
			pg.write(config.connStr, [{
				$: `UPDATE contacts SET lastmailtime = &{now} WHERE
					contact->>'email' = &{email}`,
				now: Date.now(),
				email: invitee,
			}], (err, res) => {
				if (err) {
					log.error(err);
				} else {
					log.info(`successfully updated ${res[0].rowCount} row(s) the contacts table`);
				}
			});
		});
	});
}

const sendInvitationEmail = () => {
	const UTCHours = new Date().getUTCHours();
	// Do not send any mails between 8:30 pm (IST) and 6:30 am
	if (UTCHours >17 && UTCHours < 2) {
		log.info('Do not send invitations in these hours: ', UTCHours);
		return;
	}
	let row = false;
	let contactEmails = [], prevReferrer;
	pg.readStream(config.connStr, {
		$: `SELECT * FROM contacts WHERE (contact->>'email') IS NOT NULL AND valid = 'true'
			AND lastmailtime IS NULL ORDER BY referrer LIMIT &{limit}`,
		limit: config.invitationEmail.limit /*5*/
	})
	.on('row', async invitee => {
		row = true;
		log.info(`starting invitation process for invitee with email ${invitee.contact.email}, referred by ${invitee.referrer}`);
		if(invitee.referrer !== prevReferrer && contactEmails.length > 0) {
			initMailSending(contactEmails, prevReferrer);
			contactEmails = [];
		}
		prevReferrer = invitee.referrer;
		contactEmails.push(invitee.contact.email);
	})
	.on('end', () => {
		if (row) {
			log.info('invitation process finished !');
			log.info('Sending for last inviter: ', prevReferrer);
			initMailSending(contactEmails, prevReferrer);
		} else log.info('Did not send any invitation email');
	});
};

export default function () {
	setTimeout(() => {
		log.info('Starting invitation email.');
		sendInvitationEmail();
		setInterval(sendInvitationEmail, JOB_INVOCATION_INTERVAL);
	}, /*3000,*/ config.invitationEmail.delay);
}
