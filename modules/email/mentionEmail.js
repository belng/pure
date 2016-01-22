"use strict";
const MENTION_INTERVAL = 10 * 60 * 1000,
	  MENTION_DELAY = 10 * 60 * 1000;

let pg = require("../../lib/pg"),
	config = require("../../core").config.email, 
	constants = require("../../lib/constants"),
	connStr = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db,
	lastEmailSent;

function sendMentionEmail() {
	let getMailObj = require("./prepareMailObj"),
		initMailSending = require("./digestEmail").initMailSending,
		start = lastEmailSent,
		end = Date().now - MENTION_DELAY;
	pg.readStream(connstr, {
		$: `with
				r as (SELECT * FROM textrelations, users WHERE "user" = id AND role = &{mention})
			select * from r, texts WHERE r.item=texts.id order by r.user`,
		start: start,
		end: end,
		mention: constants.ROLE_MENTIONED
	}).on("row", (userRel) => {
		let emailObj = sendEmailToUser(userRel) || {};
		
		if (Object.keys(emailObj).length !== 0) initMailSending(emailObj);
	}).on("end", function() {
		let c = getMailObj({});
		initMailSending(c);
		pg.write(connString, {
			$: "UPDATE jobs SET lastrun=&{end} WHERE jobid=&{jid}",
			end: end,
			jid: constants.JOB_EMAIL_MENTION
		}, function (err, results) {
			if(!err) log.i("successfully updated jobs");
		});
	});
}

module.exports = (row) => {
	lastEmailSent = row.lastrun;
	setInterval(sendMentionEmail, MENTION_INTERVAL);
}