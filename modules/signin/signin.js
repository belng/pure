"use strict";

// sign with default (HMAC SHA256)
var core = require("../../core.js"),
	bus = core.bus,
	cache = core.cache;

function signinhandler(changes, next) {
	if (changes.auth && changes.auth.signin) {
		if (changes.auth.signin.id) {
			cache.getEntity(changes.auth.signin.id, function(err, entity) {
				if (err) return next(err);
				if (!entity) return next(new Error("INVALID_USERID"));
				changes.app = (changes.app || {}).user = entity.id;
				((changes.response = (changes.response || {})).app || {}).user = entity.id;
				(changes.response.entities = changes.response.entities || {})[entity.id] = entity;
				delete changes.auth.signin;
				return next();
			});
		} else if (changes.auth.signin.identities.length) {
			cache.getEntityByIdentity(changes.auth.signin.identities[0], function(err, entity) {
				if (err) return next(err);
				if (entity) {
					changes.app = (changes.app || {}).user = entity.id;
					(changes.response.app = (changes.response = (changes.response || {})).app || {}).user = entity.id;
					(changes.response.entities = changes.response.entities || {})[entity.id] = entity;
					delete changes.auth.signin;
				} else {
					(changes.response.app = (changes.response = (changes.response || {})).app || {}).user = null;
				}
				return next();
			});
		}
	} else {
		return next();
	}
}

bus.on("setstate", signinhandler, "authentication");
console.log("signin module ready...");