"use strict";
let engine = require("engine.io"),
	core = require("../../core"),
	bus = core.bus,
	config = core.config,
	constants = require("../../lib/constants"),
	uid = require("../../lib/uid-server"),
	notify = require("../../lib/notify"),
	sockets = {};

function sendError(socket, code, reason, event) {
	socket.send(JSON.stringify({
		type: "error",
		code,
		reason,
		event: event
	}));
}

bus.on("http/init", httpServer => {
	let socketServer = engine.attach(httpServer);

	socketServer.on("connection", socket => {
		let resourceId = uid(16);
		sockets[resourceId] = socket;

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

			bus.emit("setstate", message, err => {
				if (err) return sendError(
					socket, err.code || "ERR_UNKNOWN", err.message, message
				);
				
				if(message.response) socket.send(message.response);
			});
		});
	});
});

bus.on("setstate", changes => {
	notify(changes, core, {}).on("data", (change, rel) => {
		Object.keys(rel.resources).forEach(function(e) {
			if (!sockets[e]) return;
			sockets[e].send(JSON.stringify(change));
		});
	});
});