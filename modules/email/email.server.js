let log = ("../lib/logger.js"),
	app = require("../../app"),
	redis = require("redis"),
	cache = app.cache, config = app.config, core = app.core;

function addMessage(msg) {

}

module.exorts = () => {
	redis = redis.createClient();
	redis.select(config.redisDB);
	if(!config.auth) {
		log.i("Email module not enabled");
		return;
	}
	require("./welcomeEmail.js")(cache, config);
	require("./dailyEmail.js")(cache, config);

	core.on("text", (msg, cb) => {
		cb();
		addMessage(msg);
	});
};
