const DIGEST_INTERVAL = 60 * 60 * 1000,
	  DIGEST_DELAY = 24 * 60 * 60 * 1000;

let config, send, connStr, constants,
	log = require("../lib/logger.js"),
	fs = require("fs"),
	handlebars = require("handlebars"),
	pg = require("../lib/pg"),
	jwt = require("jsonwebtoken"),
	connstr = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db,
	template = handlebars.compile(fs.readFileSync(__dirname + "/views/" + config.appName + ".digest.hbs", "utf-8"));


function initMailSending (row) {
	let user = row.id,
		emailAdd = row.identities,
		emailHtml = template({
			
		})
}

function sendDigestEmail () {
	let startPoint = Date().now - 2 * DIGEST_DELAY,
		start = lastEmailSent < startPoint ? lastEmailSent : startPoint,
		end = Date().now - DIGEST_DELAY;
	pg.readStream(connstr, {
		$: `WITH u AS (SELECT * FROM users WHERE lastOnline > &{start} AND lastOnline < &{end}),
			t AS (SELECT * FROM threadMembers WHERE updateTime > statusTime AND updateTime > &{start})
			SELECT * FROM u JOIN threadRels ON u.id = t.user ORDER BY u.id`,
		start: start,
		end: end
	}).on("row", (row) => {
		initMailSending(row);
	});
	
	pg.write(connString, {
		$: "UPDATE jobs SET lastrun=&{end} WHERE jobid=&{jid}",
		end: end,
		jid: constants.JOB_EMAIL_DIGEST
	}, function (err, results) {
		if(!err) log.i("successfully updated jobs");
	});
}

module.exports = (row) => {
	let app = require("../../app"), config = app.config, constants = app.constants;
	send = require("./sendEmail");
	lastEmailSent = row.lastrun;
	setInterval(sendDigestEmail, DIGEST_INTERVAL);
}

