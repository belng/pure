"use strict";

let pg = require("../../lib/pg"),
	log = require("winston"),
	constants = require("../../lib/constants.json"),
	config = {
		pg: {
			username: "scrollback",
			password: "",
			server: "localhost",
			db: "pure"
		},
		auth: true
	},
	connString = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db;

module.exports = () => {
	if(!config.auth) {
		log.info("Email module not enabled");
		return;
	}
	let /*sendWelcomeEmail = require ("./welcomeEmail"),
		sendMentionEmail = require("./mentionEmail"),*/
		sendDigestEmail = require ("./digestEmail");
	pg.read(connString, {
		$: "SELECT * FROM jobs WHERE jobid in (&(jids))",
		jids: [/*constants.JOB_EMAIL_WELCOME, constants.JOB_EMAIL_MENTION, */constants.JOB_EMAIL_DIGEST]
	}, function (err, results) {
		results.forEach((row) => {
			switch(row.jobid) {
				case constants.JOB_EMAIL_WELCOME:
					sendWelcomeEmail(row);
					break;
				case constants.JOB_EMAIL_MENTION:
					sendMentionEmail(row);
					break;
				case constants.JOB_EMAIL_DIGEST:
					sendDigestEmail(row);
					break;
			}
		});
	});	
}

