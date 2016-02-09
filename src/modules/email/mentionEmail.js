'use strict';
const MENTION_INTERVAL = 10 * 60 * 1000, MENTION_DELAY = 10 * 60 * 1000;

import { Constants } from '../../core';
import Counter from '../../lib/counter';
import log from 'winston';
let pg = require('../../lib/pg'),
	connStr, lastEmailSent;

function sendMentionEmail() {
	let getMailObj = require('./buildMailObj'),
		initMailSending = require('./digestEmail').initMailSending,
		start = lastEmailSent, ended,
		end = Date.now() - MENTION_DELAY;
	let counter = new Counter();

	pg.readStream(connStr, {
		$: `with textrel as (select * from textrels join users on "user"=id where not (users.tags @> '{10}') and roletime>users.presencetime) select * from textrel join texts on textrel.item=texts.id order by textrel.user`,
		start: start,
		end: end,
	}).on('row', (urel) => {
		counter.inc();
		pg.read(connStr, {
			$: `select * from rooms where id=&{id} `, //and presencetime<&{roletime}
			id: urel.parents[1]
		}, (err, room) => {
			urel.roomName = room[0].name;
			console.log('trel: ', urel.user);
			let emailObj = getMailObj(urel) || {};

			if (Object.keys(emailObj).length !== 0) {
				initMailSending(emailObj);
			}
			counter.dec();
			counter.then(() => {
				let c = getMailObj({});
				initMailSending(c);
				pg.write(connStr, [ {
					$: 'UPDATE jobs SET lastrun=&{end} WHERE jobid=&{jid}',
					end: end,
					jid: Constants.JOB_EMAIL_MENTION
				} ], function (err, results) {
					if (!err) log.info('successfully updated jobs');
				});
			});
		});
	}).on('end', function() {
		console.log('ended');
	});
}

module.exports = (row, conf) => {
	connStr = 'pg://' + conf.pg.username + ':' + conf.pg.password + '@' + conf.pg.server + '/' + conf.pg.db;
	lastEmailSent = row.lastrun;
	console.log(lastEmailSent);
	sendMentionEmail();
	setInterval(sendMentionEmail, MENTION_INTERVAL);
};