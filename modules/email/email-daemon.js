/*
	The separate email server.
*/

/*
	CREATE TABLE jobs (
		jobid INTEGER PRIMARY KEY,
		lastrun BIGINT
	);
	
	CREATE MATERIALIZED VIEW userMembership AS
	SELECT * FROM users LEFT OUTER JOIN members ON members.user = users.id
	
	// Digest email query

WITH
	u AS (SELECT * FROM users WHERE lastOnline > &{now-2_days} AND lastOnline < &{now-1_day}),
	t AS (SELECT * FROM threadMembers WHERE updateTime > statusTime AND updateTime > &{now-2_days})
SELECT * FROM u JOIN threadRels ON u.id = t.user ORDER BY u.id
	
*/

const pg = require("../lib/pg"),

let constants = require("../../lib/constats.json"),
	connString = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db;

module.exports = () => {
	let sendWelcomeEmail = require ("./welcomeEmail"),
		sendMentionEmail = require("./mentionEmail"),
		sendDigstEmail = require ("./digestEmail");

	pg.read(connString, {
		$: "SELECT * FROM jobs WHERE jobid in (&(jids))",
		jids: [constants.JOB_EMAIL_WELCOME, constants.JOB_EMAIL_MENTION, constants.JOB_EMAIL_DIGEST]
	}, function (err, results) {
		results.forEach((row) => {
			switch(row.jobid) {
				case 1:
					sendWelcomeEmail(row);
					break;
				case 2:
					sendMentionEmail(row);
					break;
				case 3:
					sendDigestEmail(row);
					break;
			}
		});
	});	
}






