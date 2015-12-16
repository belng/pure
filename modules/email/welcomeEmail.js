const WELCOME_INTERVAL = 5 * 60 * 1000,
	  WELCOME_DELAY = 5 * 60 * 1000;

let fs = require("fs"),
	jwt = require("jsonwebtoken"),
	handlebars = require("handlebars"),
	send = require("./sendEmail.js"),
	template = handlebars.compile(fs.readFileSync(__dirname + "/views/welcomeEmail.hbs", "utf-8")),
	config, lastEmailSent,
	connStr = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db;

function userFromUserRel(user) {
	return {
		id: user.id,
		identities: user.identities,
		createTime: user.createTime,
		params: user.params
	}
}

function relFromUserRel(rel) {
	return {
		user: rel.user,
		item: rel.item,
		tags: rel.tags,
		role: rel.role,
		status: rel.status,
		statusTime: rel.statusTime
	}
}

function sendWelcomeEmail () {
	let end = Date.now() - WELCOME_DELAY,
		currentUser = {},
		currentRels = [];
	
	pg.readStream(connStr, {
		$: `SELECT * FROM users LEFT OUTER JOIN members
			ON members.user = users.id WHERE identities @> '{email}'
			AND createTime > &{start} AND createTime <= &{end} ORDER BY users.id`,
		start: lastEmailSent,
		end: end
	}).on("row", function (userRel) {
		let user = userFromUserRel(userRel),
			rel = relFromUserRel(userRel);
		
		if (user.id !== currentUser.id) {
			let emailAdd = user.identities,
				emailHtml = template({
					user: currentUser,
					rels: currentRels,
					domain: config.domain,
					token: jwt.sign({ email: emailAdd }, config.secret, {expiresIn: "2 days"})
				});
			send(config.from, emailAdd, "Welcome to " + config.appName, emailHtml);
			currentUser = user;
			currentRels = [rel];
		} else {
			currentRels.push(rel);
		}
		
	});
	
	pg.write(connString, {
		$: "UPDATE jobs SET lastrun=&{end} WHERE jobid=&{jid}",
		end: end,
		jid: constants.JOB_EMAIL_WELCOME
	}, function (err, results) {
		if(!err) log.i("successfully updated jobs");
	});
}

module.exports = (row) => {
	config = require("../../app").config;
	lastEmailSent = row.lastrun;
	setInterval(sendWelcomeEmail, WELCOME_INTERVAL);
}