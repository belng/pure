let engine = require("engine.io"),
	core = require("../../core"),
	config = core.config,
	constants = require("../../lib/constants"),
	uid = require("../../lib/uid"),
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

core.on("http/init", httpServer => {
	let socketServer = engine.attach(httpServer);

	socketServer.on("connection", socket => {
		let resourceId = uid(16);
		sockets[resourceId] = socket;

		socket.on("close", () => {
			core.emit("presence/offline", { resourceId });
			delete sockets[resourceId];
		});

		socket.on("message", message => {
			try {
				message = JSON.parse(message);
			} catch (e) {
				return sendError(socket, "ERR_EVT_PARSE", e.message);
			}

			message.resourceId = resourceId;

			core.emit("state", message, err => {
				if (err) return sendError(
					socket, err.code || "ERR_UNKNOWN", err.message, message
				);
			});
		});
	});
});

core.on("change", changes => {
	notify(changes, core, { }).on("data", (note) => {
		if (!sockets[note.resourceId]) return;
		sockets[note.resourceId].send(JSON.stringify(note.changes));
	});

	for (let notifyUser of message.notify) {
		if(notifyUser.resources) notifyUser.resources.forEach(resourceId => {
			if(!sockets[resourceId]) return;
			sockets[resourceId].send(JSON.stringify(extract(message, notifyUser.id)));
		});
	}
});

core.on("response", changes => {

});
