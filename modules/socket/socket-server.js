"use strict";
let engine = require("engine.io"),
	core = require("../../core"),
	bus = core.bus,
	config = core.config,
	constants = require("../../lib/constants"),
	uid = require("../../lib/uid-server"),
	notify = require("./dispatch"),
	sockets = {},
	models = require("../../models/models.js"),
	stringPack = require("stringPack"),
	packerArg;

packerArg = Object.keys(models).sort().map(key =>models[key]);
packer = stringPack(packerArg);


function sendError(socket, code, reason, event) {
	socket.send(JSON.stringify({
		type: "error",
		code,
		reason,
		event: event
	}));
}

bus.on("http/init", app => {
	let socketServer = engine.attach(app.httpServer);

	socketServer.on("connection", socket => {
		let resourceId = uid(16);
		sockets[resourceId] = socket;

		console.log("socket connection created");
		socket.on("close", () => {
			bus.emit("presence/offline", {
				resourceId
			});
			delete sockets[resourceId];
		});

		socket.on("message", message => {
			try {
				message = packer.decode(message);
			} catch (e) {
				return sendError(socket, "ERR_EVT_PARSE", e.message);
			}

			message.id = uid(16);
			(message.auth = message.auth | {}).resource = resourceId;
			console.log("emitting setstate", message);
			bus.emit("setstate", message, err => {
				console.log(err, message);
				if (err) return sendError(
					socket, err.code || "ERR_UNKNOWN", err.message, message
				);

				if (message.response) {
					if (message.auth && message.auth.user) {
						bus.emit("presence/online", {
							resource: resourceId,
							user: message.auth.user
						});
					}
					socket.send(packer.encode(message.response));
				}
			});
		});
	});
});

bus.on("statechange", changes => {
	notify(changes, core, {}).on("data", (change, rel) => {
		Object.keys(rel.resources).forEach(function (e) {
			if (!sockets[e]) return;
			sockets[e].send(packer.encode(change));
		});
	});
});