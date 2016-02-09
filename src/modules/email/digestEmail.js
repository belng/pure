'use strict';
const DIGEST_INTERVAL = 60 * 60 * 1000, DIGEST_DELAY = 24 * 60 * 60 * 1000;

import { Constants, config } from '../../core';
import log from 'winston';
import fs from 'fs';
import handlebars from 'handlebars';
import pg from '../../lib/pg';
import jwt from 'jsonwebtoken';
import send from './sendEmail';
import Counter from '../../lib/counter';

let conf = config.email, lastEmailSent,
	connStr = 'pg://' + config.pg.username + ':' + config.pg.password + '@' + config.pg.server + '/' + config.pg.db,
	template = handlebars.compile(fs.readFileSync(__dirname + '/views/' + config.appName + '.digest.hbs', 'utf-8'));

function getSubject(rels) {
	var counts = rels.length - 1, heading = '';
	heading = '[' + rels[0].room + '] ' + rels[0].threads[0].threadTitle + ' +' + counts + ' more';
	return heading;
}

function initMailSending (userRel) {
	let user = userRel.currentUser,
		rels = userRel.currentRels,
		emailAdd = user.identities.filter((ident) => ident.indexOf('mailto:') === 0),
		emailHtml = template({
			token: jwt.sign({ email: emailAdd }, conf.secret, { expiresIn: '5 days' }),
			domain: conf.domain,
			rooms: rels
		}),
		emailSub = getSubject(rels);
	console.log(emailSub);
	send(conf.from, emailAdd, emailSub, emailHtml);
}

function sendDigestEmail () {
	let getMailObj = require('./buildMailObj'),
		startPoint = Date().now - 2 * DIGEST_DELAY,
		start = lastEmailSent < startPoint ? lastEmailSent : startPoint,
		end = Date.now() - DIGEST_DELAY;
	let counter = new Counter();

	function getTimezone(hour) {
		let UtcHrs = new Date().getUTCHours(),
			c = UtcHrs > 12 ? 24 - UtcHrs : UtcHrs;

		let d = c > hour ? c - hour : hour - c,
			tz = d * 60;

		let tzMin = tz - 30,
			tzMax = tz + 30;
		return { min: tzMin, max: tzMax };
	}


	let tz = getTimezone(conf.digestEmailTime);
	console.log(tz);
	if (conf.debug) {
		start = 0, end = Date.now(), tz.min = 0, tz.max = 1000;
	}

	/*WITH
              urel AS (WITH u AS (SELECT * FROM users, roomrelations rr WHERE rr.user=users.id AND role >= &{follower}
	          AND presencetime > &{start} AND presencetime < &{end} AND timezone >= &{min} AND timezone < &{max})
              SELECT u.id uid, rooms.name rname, * FROM u, rooms WHERE u.item=rooms.id)
            SELECT urel.uid uid, urel.rname rname, threads.name title, * FROM threads, urel where urel.item = threads.parents[1]
            AND threads.updateTime > urel.presencetime order by uid*/

	pg.readStream(connStr, {
		$: `with urel as (select rrls.presencetime ptime, * from users join roomrels rrls on users.id=rrls.user where roles @> '{3}' and rrls.presencetime < &{end} and timezone >= &{min} and timezone < &{max}) select * from urel join threads on threads.parents[1]=urel.item order by urel.id`, //where threads.createtime > urel.ptime
		start: start,
		end: end,
		follower: Constants.ROLE_FOLLOWER,
		min: tz.min,
		max: tz.max
	}).on('row', (urel) => {
		counter.inc();
		pg.read(connStr, {
			$: `select * from rooms where id=&{id} `, //and presencetime<&{roletime}
			id: urel.parents[0]
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

module.exports = (row) => {
	lastEmailSent = row.lastrun;
	let UtcMnts = new Date().getUTCMinutes();
	let delay = UtcMnts < 30 ? 30 : 90,
		after = conf.debug ? 0 : (delay - UtcMnts) * 60000;

	setTimeout(function() {
		sendDigestEmail();
		setInterval(sendDigestEmail, DIGEST_INTERVAL);
	}, after);
};
module.exports.initMailSending = initMailSending;
