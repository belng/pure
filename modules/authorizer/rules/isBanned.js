const core = require("./../../core"),
	  cache = core.cache,
	  constants = core.constants;

module.exports = function (user, entity) {
	var promise = new Promise(function(resolver, reject) {
		cache.getRelation(user, entity, function(err, relation) {
			if(err) return reject(err);
			if(relation.role === constants.ROLE_BANNED) return reject("banned");
			resolve();
		});
	});
	
	return promise;
};
