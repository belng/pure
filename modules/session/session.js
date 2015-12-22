"use strict";

// sign with default (HMAC SHA256)
var jwt = require("jsonwebtoken"),
	app = require("../../app.js"),
	core = app.core,
	config = app.config,
	iss = config.host,
	aud = config.host,
	key = config.session.privateKey;

function getEmailFromSession(session) {
	return new Promise(function(resolve, reject) {
		jwt.verify(session, key, { aud: aud}, function(err, decoded) {
			if (err) return reject(err);
			else resolve(decoded.sub);
		});
	});
}

function generateSession(sub) { // not sure if this should strictly be mailto ident?
	return new Promise(function(resolve) {
		jwt.sign({
			iss: iss, sub: sub, aud: aud,
			iat: Math.floor((new Date()).getTime() / 1000),
			exp: Math.floor((new Date()).getTime() / 1000) + 604800 // seven days
		}, key, {
			algorithm: "HS256",
			type: "JWS"
		}, function(session) {
			resolve(session);
		});
	});
}

function sessionHandler(changes, next) {
	let signin = {};
	if (changes.auth && changes.auth.session) {
		getEmailFromSession(changes.auth.session)
		.then(function(sub) {
			if (sub.indexOf(":") === 0) {
				signin.identities = [ sub ];
			} else {
				changes.auth.user = sub;
				signin.id = sub;
			}
			signin.params = {};
			changes.auth.signin = signin;
			next();
		})
		.catch(next);
	} else if (changes.response && changes.response.app && changes.response.app.user) {
		generateSession(changes.response.app.user).then(function(session) {
			changes.response.app.session =	session;
			next();
		});
	}
}

module.exports = function() {
	core.on("setstate", sessionHandler, "authentication");
};
