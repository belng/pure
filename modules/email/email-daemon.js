"use strict";

let pg = require("../../lib/pg"),
	winston = require("winston"),
	constants = require("../../lib/constants.json"),
	conf = require("../../core").config, config = conf.email,
	connString = "pg://" + config.pg.username + ":" + config.pg.password + "@" + 
	config.pg.server + "/" + config.pg.db;

(() => {
	if(!config.auth) {
		winston.info("Email module not enabled")
		return;
	}
	let sendWelcomeEmail = require ("./welcomeEmail"),
		sendMentionEmail = require("./mentionEmail"),
		sendDigestEmail = require ("./digestEmail");
	pg.read(connString, {
		$: "SELECT * FROM jobs WHERE jobid in (&(jids))",
		jids: [/*constants.JOB_EMAIL_WELCOME, constants.JOB_EMAIL_MENTION, */constants.JOB_EMAIL_DIGEST]
	}, function (err, results) {
		results.forEach((row) => {
			switch(row.jobid) {
				case constants.JOB_EMAIL_WELCOME:
					sendWelcomeEmail(row, config);
					break;
				case constants.JOB_EMAIL_MENTION:
					sendMentionEmail(row, config);
					break;
				case constants.JOB_EMAIL_DIGEST:
					sendDigestEmail(row, config);
					break;
			}
		});
	});
})();
