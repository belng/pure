import { config } from '../../core-server';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import Logger from '../../lib/logger';
const transport = nodemailer.createTransport(smtpTransport({
	host: config && config.email && config.email.host,
	protocol: 'smtp',
	secureConnection: true,
	port: 465,
	auth: config && config.email && config.email.auth,
})), log = new Logger(__filename);

export default function send (from, to, sub, html, cb) {
	const email = {
		from,
		to,
		subject: sub,
		html,
		bcc: config && config.bcc || '',
	};

	transport.sendMail(email, (e) => {
		if (e) {
			if (cb) cb(e);
			log.info('error in sending email: ', e, 'retrying...');
			setTimeout(() => {
				send(email.from, email.to, email.subject, email.html);
			}, 300000);
		} else {
			log.info('Email sent successfully to ', email.to);
			if (cb) cb(null);
		}
	});
}
