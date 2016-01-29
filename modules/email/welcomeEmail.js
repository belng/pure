"use strict";
const WELCOME_INTERVAL = 5 * 60 * 1000,
	  WELCOME_DELAY = 5 * 60 * 1000;

import winston from "winston";
import fs from "fs";
import jwt from "jsonwebtoken";
import handlebars from "handlebars";
import pg from "../../lib/pg";
import send from "./sendEmail.js";
import {Constants} from "../../core";
let template = handlebars.compile(fs.readFileSync(__dirname + "/views/welcomeEmail.hbs", "utf-8")),
	lastEmailSent, config, connStr ;

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
		winston.info("sendng welocome email")
		let emailObj = getMailObj(userRel) || {};
		
		if (Object.keys(emailObj).length !==0) initMailSending(emailObj);
	}).on("end", function() {
		let c = getMailObj({}); // empty obj to get email obj for last row data
		initMailSending(c);
		pg.write(connString, {
			$: "UPDATE jobs SET lastrun=&{end} WHERE jobid=&{jid}",
			end: end,
			jid: Constants.JOB_EMAIL_WELCOME
		}, function (err, results) {
			if(!err) log.i("successfully updated jobs");
		});
	});
}

module.exports = (row, conf) => {
	config = conf;
	connStr = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db;
	if(config.debug) {
		sendWelcomeEmail()
	}
	lastEmailSent = row.lastrun;
	setInterval(sendWelcomeEmail, WELCOME_INTERVAL);
}
