"use strict";

// sign with default (HMAC SHA256)
var app = require("../../app.js"),
	core = app.core,
	cache = app.cache;
function signuphandler(changes, next) {
	if (changes.auth && changes.auth.signup && changes.auth.signup.id) {
		cache.getEntity(changes.auth.signup.id, function(err, entity) {
			if (err) return next(err);
			if (entity) return next(new Error("USER_ALREADY_EXIST"));

			changes.app = (changes.app || {}).user = entity.id;
			((changes.response = (changes.response || {})).app || {}).user = changes.auth.signup.id;
			(changes.response.entities = changes.response.entities || {})[changes.auth.signup.id] = changes.auth.signup;
			return next();
		});
	}
}

module.exports = function() {
	core.on("setstate", signuphandler, "authentication");
};
