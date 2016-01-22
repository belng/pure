const core = require("./../../core");
const rules = [];

rules.push(require("./rules/isBanned.js"));

function authorizeEntity(entity, resource) {
	const promise = new Promise(function (reject, resolve) {
		const promises = [];

		rules.forEach(function(rule) {
			promises.push(rule(entity, resource));
		});

		Promise.all(promises).then(function() {
			resolve();
		}, function(reason) {
			reject(reason);
		});
	});

	return promise;
}

core.bus.on("setstate", (changes, next) => {
	const promises = [];

	if (!changes.entities) return next();
	Object.keys(changes.entities).forEach(function(key) {
		promises.push(authorizeEntity(changes.entities[key], changes.auth.resource));
	});

	Promise.all(promises).then(function() {
		next();
	}, function(reason) {
		next(new Error(reason));
	});
}, 900);

console.log("authorizer module ready...");
