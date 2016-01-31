/* eslint-env browser */

var eio = require("engine.io-client/engine.io"),
	core = require("../../core.js"),
	backOff = 1, client, config = core.config, bus = core.bus,
	protocol = config.server.protocol,
	host = config.server.apiHost,
	models = require("../../models/models.js"),
	stringPack = require("stringPack"),
	packerArg;

packerArg = Object.keys(models).sort().map(key =>models[key]);
packer = stringPack(packerArg);

function disconnected() {

	/* eslint-disable block-scoped-var, no-use-before-define */
	var connectionStatus = "offline";

	if (backOff < 256) backOff *= 2;
	else backOff = 256;

	bus.emit("setstate", {
		app: { connectionStatus, backOff}
	});
	setTimeout(connect, backOff * 1000);
}

function onMessage(message) {
	var stateChange = packer.decode(message);
	bus.emit("setstate", stateChange);
}

function connect() {
	client = new eio.Socket((protocol === "https:" ? "wss:" : "ws:") + "//" + host, {
		jsonp: "createElement" in document // Disable JSONP in non-web environments, e.g.- react-native
	});

	client.on("close", disconnected);

	client.on("open", function() {
		var connectionStatus = "online";
		backOff = 1;
		bus.emit("setstate", {
			app: { connectionStatus, backOff}
		});
	});

	client.on("message", onMessage);
}

bus.emit("setstate", (state, next) => {
	client.send(packer.encode(state))
}, 1);