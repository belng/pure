require("babel/register");

var core = new (require("ebus"))(),
	jsonCat = require("json-cat"),
	config;

try {
	config = require("./server-config.json");
} catch (e) {
	config = {};
}

config = jsonCat(require("config"))

require("./modules/http/http-server.js")(core);
require("./modules/socket/socket-server.js")(core);
require("./modules/html/html-server.js")(core);

