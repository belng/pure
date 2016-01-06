"use strict";

// sign with default (HMAC SHA256)
var jwt = require("jsonwebtoken"),
	tokenValidity = 604800, // seven days
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
			exp: Math.floor((new Date()).getTime() / 1000) + tokenValidity // seven days
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
			changes.auth.user = sub; // sign in
			signin.id = sub;
			signin.params = {};
			next();
		})
		.catch(next);
	}/* is needed?

	else if (changes.auth && changes.auth.signin && changes.auth.signin.identities && changes.auth.signin.identities.length) {
		generateSession(changes.auth.signin.identities[0]).then(function(session) {
			changes.auth.session =	session;
			next();
		});
	}*/
}

module.exports = function() {
	core.on("setstate", sessionHandler, "authentication");
	core.on("setstate", function(changes, next) {
		if (changes.response && changes.response.app && changes.response.app.user) {
			generateSession(changes.response.app.user).then(function(session) {
				changes.response.app.session =	session;
				next();
			});
		}
	}, "modifier");
};
