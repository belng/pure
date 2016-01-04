"use strict";

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

require("./modules/socket/socket-server"); 
require("./modules/ui/ui-server");
require("./modules/http/http"); // if fired before socket server then the http/init listen might not be listening..
