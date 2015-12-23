"use strict";
const MENTION_INTERVAL = 5 * 60 * 1000,
	  MENTION_DELAY = 5 * 60 * 1000;

let pg = require("../lib/pg"),
	/*fs = require("fs"),
	jwt = require("jsonwebtoken"),
	handlebars = require("handlebars"),
	send = require("./sendEmail.js"),
	template = handlebars.compile(fs.readFileSync(__dirname + "/views/" + config.appName + ".digest.hbs", "utf-8")),
	*/config, constants, lastEmailSent,
	connStr = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db;

function sendMentionEmail() {
	let sendEmailToUser = require("./welcomeEmail").sendEmailToUser,
		initMailSending = require("./digestEmail").initMailSending,
		start = lastEmailSent,
		end = Date().now - MENTION_DELAY,
		cUserRel;

	pg.readStream(connstr, {
		$: ``,
		start: start,
		end: end,
		follower: constants.ROLE_FOLLOWER
	}).on("row", (userRel) => {
		cUserRel = sendEmailToUser(userRel) || {};
		
		if (Object.keys(s).length !== 0) initMailSending(cUserRel);
	}).on("end", function() {
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