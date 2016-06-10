import * as pg from '../../../lib/pg';
import fs from 'fs';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import log from 'winston';
const template = handlebars.compile(
  fs.readFileSync(__dirname + '/send.hbs', 'utf-8').toString()
);
const connstr = 'pg://pure:1egynurjeio2394g5urmed@pure.cphzgtf5molv.ap-southeast-1.rds.amazonaws.com/pure';


const transport = nodemailer.createTransport(smtpTransport({
	host: 'email-smtp.us-west-2.amazonaws.com',
	protocol: 'smtp',
	secureConnection: true,
	port: 465,
	auth: {
		user: 'AKIAJAVLBYOVQ44MEBTA',
		pass: 'AqSA6SE6sQHGcj4RWyAo5T/JRYJVzfBYEIe17l6xdnrz'
	}
}));

function send (from, to, sub, html, cb) {
	const email = {
		from,
		to,
		subject: sub,
		html
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

function sendEmail() {
	const roomNames = [];
	pg.readStream(connstr, {
		$: 'select name from rooms where id in (select parents[1] from threads where creator <> \'shreyaskutty\' and creator <> \'juhi\' and creator <>\'belong\' and creator<> \'belongbot\' and createtime >= extract(epoch from now()-interval \'3 hours\')*1000);'
	}).on('row', (r) => {
		roomNames.push([ r.name ]);
	}).on('end', () => {
		log.info(roomNames);
		const emailHtml = template({ data: roomNames });
		send('belong@bel.ng', 'chandra@bel.ng', 'rooms having new discussions', emailHtml, (e) => {
			if (!e) log.info('successfully sent');
		});
	});
}

sendEmail();
setInterval(sendEmail, 3 * 60 * 60 * 1000);
