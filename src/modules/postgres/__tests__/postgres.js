"use strict";

require("babel-core/register");

const core = require("../../../core"),
	Constants = require("../../../../Constants/Constants.json");

core.config = { connStr: "pg://aravind@localhost/aravind" };

require("../postgres");

core.bus.emit("setstate", { entities: {
	"a807d644-eb87-43a5-ab2d-3f630c222975": {
		id: "a807d644-eb87-43a5-ab2d-3f630c222975",
		type: Constants.TYPE_ROOM,
		name: "Open House",
		body: "Chat with all heyneighbor users",
		createTime: Date.now()
	}
} });
