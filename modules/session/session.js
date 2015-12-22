"use strict";

// sign with default (HMAC SHA256)
var jwt = require('jsonwebtoken'),
	app = require("../../app.js"),
	config = app.config,
	iss = config.host,
	aud = config.host,
	sub, key = config.session.privateKey;

function getEmailFromSession(session) {
	return new Promise(function(resolve, reject) {
		jwt.verify(session, key, { aud: aud}, function(err, decoded) {
			if(err) return reject(err);
			else resolve(decoded.sub);
		});
	});
}

function generateSession(mailToIdent) { // not sure if this should strictly be mailto ident?
	return new Promise(function(resolve) {
		jwt.sign({
			iss: iss, sub: ident.replace("mailto:",""), aud: aud,
			iat: Math.floor((new Date()).getTime() / 1000),
			exp: Math.floor((new Date()).getTime() / 1000) + 604800 // seven days
		}, key, {
			algorithm: "HS256",
			type: "JWS"
		}, function(session) {
			resolve(session);
		})
	});
}

function sessionHandler(changes, next) {
		var signin = {};
	if(changes.auth && changes.auth.session) {
		getEmailFromSession(changes.auth.session)
		.then(function(email) {
			signin.identities = ["mailto:"+user.email];
			signin.params = {};
			changes.auth.signin = response;
			next();
		})
		.catch(next);
	} else if(changes.response && changes.response.app && changes.response.app.user) {
		generateSession(changes.response.app.user.identities[0]).then(function(session) {
			changes.response.app.session =	session;
			next();
		});
	}
}




module.exports = function() {
	core.on("setstate", sessionHandler, "authentication");
};
