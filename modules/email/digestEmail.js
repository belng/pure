const DIGEST_INTERVAL = 60 * 60 * 1000,
	  DIGEST_DELAY = 24 * 60 * 60 * 1000;

let config, send, connStr, constants,
	log = require("../lib/logger.js"),
	fs = require("fs"),
	handlebars = require("handlebars"),
	pg = require("../lib/pg"),
	jwt = require("jsonwebtoken"), lastEmailSent,
	connstr = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db,
	template = handlebars.compile(fs.readFileSync(__dirname + "/views/" + config.appName + ".digest.hbs", "utf-8"));

function getSubject(rels) {
	var counts = rels.length - 1, heading = "";
	heading = "[" + rels[0].room + "] " + rels[0].threads[0].threadTitle + " +"+ counts + " more";
	return heading;
}

function initMailSending (userRel) {
	let user = userRel.currentUser,
		rels = userRel.currentRels,
		emailAdd = user.identities.filter((ident) => ident.indexOf("mailto:") === 0),
		emailHtml = template({
			token: jwt.sign({ email: emailId }, config.secret, {expiresIn: "5 days"}),
			domain: config.domain,
			rooms: rels
		}),
		emailSub = getSubject(rels);
	send(config.from, emailAdd, emailsub, emailHtml);
}

function sendDigestEmail () {
	let getMailObj = require("./prepareMailObj"),
		startPoint = Date().now - 2 * DIGEST_DELAY,
		start = lastEmailSent < startPoint ? lastEmailSent : startPoint,
		end = Date().now - DIGEST_DELAY;

	pg.readStream(connstr, {
		$: `WITH
				u AS (SELECT * FROM users, roomrelations rr WHERE rr.user = users.id AND role >= &{follower}
				AND statusTime > &{start} AND statusTime < &{end}), 
				t AS (SELECT * FROM threads LEFT OUTER JOIN threadrelations tr ON tr.item = threads.id
				WHERE updateTime > statusTime AND updateTime > &{start})
			SELECT * FROM u, t WHERE t.parents[1] = u.item AND u.id = t.user ORDER BY u.id`,
		start: start,
		end: end,
		follower: constants.ROLE_FOLLOWER
	}).on("row", (userRel) => {
		let emailObj = getMailObj(userRel) || {};
		
		if (Object.keys(emailObj).length !== 0) initMailSending(emailObj);
	}).on("end", function() {
		let c = getMailObj({}); // empty obj to get email obj for last row data
		initMailSending(c);
		pg.write(connString, {
			$: "UPDATE jobs SET lastrun=&{end} WHERE jobid=&{jid}",
			end: end,
			jid: constants.JOB_EMAIL_DIGEST
		}, function (err, results) {
			if(!err) log.i("successfully updated jobs");
		});
	});
}

module.exports = (row) => {
	let app = require("../../app"), config = app.config, constants = app.constants;
	send = require("./sendEmail");
	lastEmailSent = row.lastrun;
	setInterval(sendDigestEmail, DIGEST_INTERVAL);
}
module.exports.initMailSending = initMailSending;
