"use strict";
const MENTION_INTERVAL = 10 * 60 * 1000,
	  MENTION_DELAY = 10 * 60 * 1000;

let pg = require("../lib/pg"),
	/*fs = require("fs"),
	jwt = require("jsonwebtoken"),
	handlebars = require("handlebars"), extract(epoch from now()) * 1000
	send = require("./sendEmail.js"),
	template = handlebars.compile(fs.readFileSync(__dirname + "/views/" + config.appName + ".digest.hbs", "utf-8")),
	*/config, constants, lastEmailSent,
	connStr = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db;

function sendMentionEmail() {
	let getMailObj = require("./prepareMailObj"),
		initMailSending = require("./digestEmail").initMailSending,
		start = lastEmailSent,
		end = Date().now - MENTION_DELAY,
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
	let app = require("../../app"), config = app.config, constants = app.constants;
	lastEmailSent = row.lastrun;
	setInterval(sendMentionEmail, MENTION_INTERVAL);
}