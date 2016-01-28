"use strict";
let engine = require("engine.io"),
	core = require("../../core"),
	bus = core.bus,
	config = core.config,
	Constants = require("../../lib/Constants"),
	uid = require("../../lib/uid-server"),
	notify = require("./dispatch"),
	sockets = {},
	packer = require("stringPack")([
		require("../../models/Item"),
		require("../../models/Room"),
		require("../../models/Thread"),
		require("../../models/Text"),
		require("../../models/Note"),
		require("../../models/User"),
		require("../../models/Relation")
	]);

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
			bus.emit("presence/offline", { resourceId });
			delete sockets[resourceId];
		});

		socket.on("message", message => {
			try {
				message = JSON.parse(message);
			} catch (e) {
				return sendError(socket, "ERR_EVT_PARSE", e.message);
			}

			message.resourceId = resourceId;
			console.log("emitting setstate", message);
			bus.emit("setstate", message, err => {
				console.log(err, message);
				if (err) return sendError(
					socket, err.code || "ERR_UNKNOWN", err.message, message
				);
				
				if(message.response) socket.send(packer.encode(message.response));
			});
		});
	});
});

bus.on("setstate", changes => {
	if(changes.knowledge || changes.indexes) return;
	notify(changes, core, {}).on("data", (change, rel) => {
		Object.keys(rel.resources).forEach(function(e) {
			if (!sockets[e]) return;
			sockets[e].send(JSON.stringify(change));
		});
	});
});