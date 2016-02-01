"use strict";
/*
require("source-map-support").install();*/
import "babel-register";
import "babel-polyfill";

import core from "../core";
import jsonop from 'jsonop';

let config;
try {
	import config from "../config/server";
} catch (e) {
	config = {};
}

core.config = jsonop(defaults, config);

import "./../modules/socket/socket-server";

// Auth modules
import "./../modules/facebook/facebook";
import "./../modules/google/google";
import "./../modules/session/session";
import "./../modules/signin/signin";
import "./../modules/signup/signup";

/*###########*/
import "./../modules/count/count";
import "./../modules/note/note";
import "./../modules/upload/upload";

import "./../modules/postgres/postgres";

// import "./../modules/ui/ui-server");
import "./../modules/http/http"; // if fired before socket server then the http/init listener might not be listening..
