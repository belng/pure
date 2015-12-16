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

	cache.onchange((changes) => {
		let entities = changes.entities || {};
		for (let id in entities) {
			if ((let note = entities[id]).type === "note" && note.noteType === "mention") {
				
			}
		}
	});
};


{ $min: { "count", 3 } }

/*
Say this is coming from the client:
	entities: {
		text_or_thread_id: { text or thread object }
	}

Postgres, or some other module just before postgres,
will add some more things to entities:

		item_id_user_id_note: { note object },
		parent_room_id: { counts: { children: { _: "$.counts.children + 1" } } // Increment the count of children by one.

jsonop({
	type: room,
	counts: {
		children: 5
	}
},
{
	counts: {
		children: { _: "$.counts.children + 1" }
	}
})







*/