"use strict";

// sign with default (HMAC SHA256)
var app = require("../../app.js"),
	jwt = require("jsonwebtoken"),
	objectUtils = require("../../lib/object-utils.js"),
	tokenValidity = 604800, // seven days
	core = app.core,
	cache = app.cache,
	config = app.config,
	iss = config.host,
	aud = config.host,
	key = config.session.privateKey;

function getIdentitiesFromJWT(token) {
	return new Promise(function(resolve, reject) {
		jwt.verify(token, key, { aud: aud}, function(err, decoded) {
			if (err) return reject(err);
			else resolve(decoded.sub);
		});
	});
}

function generateSignedIdentities(identities) {
	return new Promise(function(resolve) {
		jwt.sign({
			iss: iss, sub: identities, aud: aud,
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

function signuphandler(changes, next) {
	var signup = {};
	if (changes.auth && changes.auth.signup) {
		getIdentitiesFromJWT(changes.auth.signup.signedIdentities)
		.then(function(identities) {
			changes.auth.signup.identities = identities;
			delete changes.auth.signup.signedIdentities;
			return cache.getEntity(changes.auth.signup.id, function(err, entity) {
				if (err) return next(err);
				if (entity) return next(new Error("USER_ALREADY_EXIST"));

				changes.app = (changes.app || {}).user = changes.auth.signup.id;
				((changes.response = (changes.response || {})).app || {}).user = changes.auth.signup.id;
				(changes.entities = changes.entities || {})[changes.auth.signup.id] = changes.auth.signup;
				delete changes.auth.signup;
				return next();
			});
		})
		.catch(next);
	} else if (changes.auth && changes.auth.signin) {
		if (!changes.auth.signin) changes.auth.signin = {};
		signup = objectUtils.merge(changes.auth.signin, signup);
		generateSignedIdentities(signup.identities).then(function(session) {
			signup.signedIdentities = session;
			next();
		});
	}
}

module.exports = function() {
	core.on("setstate", signuphandler, "authentication");
};
