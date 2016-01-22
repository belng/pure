const core = require("./../../core"), cache = core.cache;


function authorizerEntity(entity, resource) {
	let promise = new Promise(function(reject, resolve) {
		
	});
	
	return promise;
}

core.bus.on("setstate", (changes, next) => {
	let promises = [];
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
