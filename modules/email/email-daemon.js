const pg = require("../lib/pg"),

let constants = require("../../lib/constats.json"),
	connString = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db;

module.exports = () => {
	let sendWelcomeEmail = require ("./welcomeEmail"),
		sendMentionEmail = require("./mentionEmail"),
		sendDigstEmail = require ("./digestEmail");
	if(!config.auth) {
		log.i("Email module not enabled");
		return;
	}
	pg.read(connString, {
		$: "SELECT * FROM jobs WHERE jobid in (&(jids))",
		jids: [constants.JOB_EMAIL_WELCOME, constants.JOB_EMAIL_MENTION, constants.JOB_EMAIL_DIGEST]
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

