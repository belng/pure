require("babel/register");

var core = require("./core"),
	jsonCat = require("json-cat"),
	config;

try {
	config = require("./config.server.json");
} catch (e) {
	config = {};
}

config = jsonCat(require("./config/base.server.json"), config);

require("./modules/http/http.server.js");
require("./modules/socket/socket.server.js");
require("./modules/ui/ui.server.js");
