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
	
	function getTimezone(hour) {
		let UtcHrs = new Date().getUTCHours(),
		c = UtcHrs > 12 ? 24 - UtcHrs : UtcHrs

		let d = c > hour ? c-hour : hour-c,
			tz = d * 60;

		let tzMin = tz - 30,
			tzMax = tz + 30;
		return {min: tzMin, max: tzMax}
	}
	
	
	let tz = getTimezone(config.digestEmailTime)
	
	if(config.debug) {
		start = 0, end = date().now, tz.min = 0, tz.max = 100000
	}

	
	pg.readStream(connstr, {
		$: `WITH 
             urel AS (WITH u AS (SELECT * FROM users, roomrelations rr WHERE rr.user=users.id AND role >= &{follower} 
	                           AND statusTime > &{start} AND statusTime < &{end} AND timezone >= &{min} AND timezone < &{max}) 
                      SELECT u.id uid, rooms.name rname, * FROM u, rooms WHERE u.item=rooms.id)
            SELECT urel.uid uid, urel.rname rname, threads.name title, * FROM threads, urel where urel.item = threads.parents[1] 
            AND updateTime > statusTime AND updateTime > &{start} order by uid`,
		start: start,
		end: end,
		follower: constants.ROLE_FOLLOWER,
		min: tz.min,
		max: tz.max
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
	let UtcMnts = new Date().getUTCMinutes();
	let delay = UtcMnts < 30 ? 30 : 90;
	
	setTimeout(function(){
		sendDigestEmail();
		setInterval(sendDigestEmail, DIGEST_INTERVAL);
	}, (delay-UtcMnts)*60000);
}
module.exports.initMailSending = initMailSending;
