let log = ("../lib/logger.js"),
	app = require("../../app"),
	redis = require("redis"),
	cache = app.cache, config = app.config, core = app.core;

module.exorts = () => {
	redis = redis.createClient();
	redis.select(config.redisDB);
	if(!config.auth) {
		log.i("Email module not enabled");
		return;
	}
	require("./welcomeEmail.js")(cache, config);
	let emailDigest = require("./emailDigest.js");
	let sendMentionMail = emailDigest.sendMentionMail;

	core.onchange((changes) => {
		let entities = changes.entities || {};
		for (let id in entities) {
			if (entities[id].type === "text") {
				let text = entities[id];
				if (text.mentions && text.mentions.length !== 0) {
					text.mentions.forEach((username) => {
						sendMentionMail(username);
					});
				}
			}
		}
	});
};
