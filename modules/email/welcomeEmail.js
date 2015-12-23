"use strict";
const WELCOME_INTERVAL = 5 * 60 * 1000,
	  WELCOME_DELAY = 5 * 60 * 1000;

let fs = require("fs"),
	jwt = require("jsonwebtoken"),
	handlebars = require("handlebars"),
	pg = require("../lib/pg"),
	send = require("./sendEmail.js"),
	template = handlebars.compile(fs.readFileSync(__dirname + "/views/welcomeEmail.hbs", "utf-8")),
	config, constants, lastEmailSent, currentU = false, currentR,
	connStr = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db;

function userFromUserRel(user) {
	return {
		id: user.user,
		identities: user.identities,
		createTime: user.createTime,
		params: user.params, 
		tags: user.tags,
		timezone: user.timezone
	}
}

function relFromUserRel(rel) {
	return {
		user: rel.user, // id or identity
		topics: rel.topics,
		threadTitle: rel.name, //room display name or thread title
		threadBody: rel.body,
		parent: rel.parents[0],
		item: rel.item,
		tags: rel.tags,
		role: rel.role,
		status: rel.status,
		statusTime: rel.statusTime
	}
}

function sendEmailToUser(userRel) {
	var rel = relFromUserRel(userRel),
		user = userFromUserRel(userRel),
		cUserRel = false;	
	
	if(user.id !== currentU.id) {
		if (currentU) {
			cUserRel = {
				currentUser: currentU, 
				currentRels: currentR
			}
		}
		currentU = user;
		currentR = [
			{
				room: rel.parent,
				threads: [rel]
			}
		];
	} else {
		if(rel.parent === currentR[currentR.length-1].room) {
			currentR[currentR.length-1].threads.push(rel)
		}
		else {
			currentR.push({room: rel.parent, threads: [rel]});
		}
	}
	if (cUserRel) {
		
		cUserRel.currentRels.sort ((a, b) => { // sort according to the no of threads in a room	
			if(a.threads.length > b.threads.length) return -1;
			if(a.threads.length < b.threads.length) return 1;
			return 0;
		});
		
		for (var i in cUserRel.currentRels) {
			cUserRel.currentRels[i].threads.sort ((a, b) => { //sort threads according to interest
				return b.interest - a.interest;
			});
		}
	}
	
	return cUserRel;
}

function sendWelcomeEmail () {
	let end = Date.now() - WELCOME_DELAY,
		currentUser,
		currentRels;
	
	pg.readStream(connStr, {
		$: `SELECT * FROM users LEFT OUTER JOIN members
			ON members.user = users.id WHERE identities @> '{email}'
			AND createTime > &{start} AND createTime <= &{end} ORDER BY users.id`,
		start: lastEmailSent,
		end: end
	}).on("row", function (userRel) {

		let sendEmailToUser = sendEmailToUser(userRel) || {};
		currentRels = sendEmailToUser.currentRels;
		currentUser = sendEmailToUser.currentUser;
		
		if (currentUser){
			let emailAdd = currentUser.identities.filter((ident) => ident.indexOf("mailto:") === 0),
				emailHtml = template({
					user: currentUser,
					rels: currentRels,
					domain: config.domain,
					token: jwt.sign({ email: emailAdd }, config.secret, {expiresIn: "2 days"})
				});
			send(config.from, emailAdd, "Welcome to " + config.appName, emailHtml);
		}
	}).on("end", function() {
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

module.exports.sendEmailToUser = sendEmailToUser;