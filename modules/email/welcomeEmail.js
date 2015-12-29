"use strict";
const WELCOME_INTERVAL = 5 * 60 * 1000,
	  WELCOME_DELAY = 5 * 60 * 1000;

let fs = require("fs"),
	jwt = require("jsonwebtoken"),
	handlebars = require("handlebars"),
	pg = require("../lib/pg"),
	send = require("./sendEmail.js"),
	template = handlebars.compile(fs.readFileSync(__dirname + "/views/welcomeEmail.hbs", "utf-8")),
	config, constants, lastEmailSent,
	connStr = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db;



function initMailSending(cUserRel) {
	let user = userRel.currentUser,
		rels = userRel.currentRels,
		emailAdd = currentUser.identities.filter((ident) => ident.indexOf("mailto:") === 0),
		emailHtml = template({
			user: currentUser,
			rels: currentRels,
			domain: config.domain,
			token: jwt.sign({ email: emailAdd }, config.secret, {expiresIn: "2 days"})
		});
	send(config.from, emailAdd, "Welcome to " + config.appName, emailHtml);
}

function sendWelcomeEmail () {
	let getMailObj = require("./prepareMailObj");
	let end = Date.now() - WELCOME_DELAY;
	
	pg.readStream(connStr, {
		$: `SELECT * FROM users LEFT OUTER JOIN members
			ON members.user = users.id WHERE identities @> '{email}'
			AND createTime > &{start} AND createTime <= &{end} ORDER BY users.id`,
		start: lastEmailSent,
		end: end
	}).on("row", function (userRel) {

		let emailObj = getMailObj(userRel) || {};
		
		if (Object.keys(emailObj).length !==0) initMailSending(emailObj);
	}).on("end", function() {
		let c = getMailObj({}); // empty obj to get email obj for last row data
		initMailSending(c);
		pg.write(connString, {
			$: "UPDATE jobs SET lastrun=&{end} WHERE jobid=&{jid}",
			end: end,
			jid: constants.JOB_EMAIL_WELCOME
		}, function (err, results) {
			if(!err) log.i("successfully updated jobs");
		});
	});
}

module.exports = (row) => {
	app = require("./test/app"), config = app.config, constants = app.constants;
	lastEmailSent = row.lastrun;
	setInterval(sendWelcomeEmail, WELCOME_INTERVAL);
}
