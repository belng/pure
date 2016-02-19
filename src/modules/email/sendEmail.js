import { config } from '../../core';
import nodemailer from 'nodemailer';
import log from 'winston';
const transport = nodemailer.createTransport('SMTP', {
	host: 'email-smtp.us-east-1.amazonaws.com',
	secureConnection: true,
	port: 465,
	auth: config && config.email && config.email.auth
});

export default function send (from, to, sub, html, cb) {
	const email = {
		from,
		to,
		subject: sub,
		html,
		bcc: config && config.bcc || ''
	};

	transport.sendMail(email, (e) => {
		if (e) {
			log.info('error in sending email: ', e, 'retrying...');
			setTimeout(() => {
				send(email.from, email.to, email.subject, email.html);
			}, 300000);
			cb(e);
		} else {
			log.info('Email sent successfully to ', email.to);
			cb(null);
		}
	});
}
