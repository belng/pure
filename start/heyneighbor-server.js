require("babel/register");

const core = require("../core"),
	jsonop = require("jsonop"),
	defaults = {};

let config;

try {
	config = require("./config/server.json");
} catch (e) {
	config = {};
}

core.config = jsonop(defaults, config);

require("./modules/http/http");
require("./modules/socket/socket-server");
require("./modules/ui/ui-server");
