"use strict";

jest.autoMockOff();

let {bus, cache} = require("../../../core"),
	assert = require('assert'),
	constants = require("../../../lib/constants");

require("../relations");
describe("create relation on reply to a thread", ()=> {
	bus.emit("setstate", {
		entities: {
			"jheg38-sdfh34-sdf7-sdfhg": {
				id: "jheg38-sdfh34-sdf7-sdfhg",
				body: "this is a text message",
				type: constants.TYPE_TEXT,
				creator: "testinguser",
				parents: [["ajhg8-236dsf8-dshg327-sdhg7"]]
			}
		}
	}, (err, changes) => {
//		console.log(changes)
	})
})

describe("create relation if mention on a text(item not in entities)", ()=> {
	cache.put({
		entities: {
			"jheg38-sdfh34-sdf7-sdfhg": {
				id: "jheg38-sdfh34-sdf7-sdfhg",
				body: "@testinguser hi",
				type: constants.TYPE_TEXT,
				creator: "sbtestinguser",
				parents:[["hsdgf834-sdhf384-sdfuh34"]]
			}
		}
	});
	bus.emit("setstate", {
		entities: {
			"testinguser_jheg38-sdfh34-sdf7-sdfhg": {
				user: "testinguser",
				item: "jheg38-sdfh34-sdf7-sdfhg",
				type: constants.TYPE_TEXTREL,
				roles: [constants.ROLE_MENTIONED]
			}
		}
	}, (err, changes) => {
//		console.log(changes)
	})
})


describe("create relation if mention on a text(item in entities)", ()=> {
	
	bus.emit("setstate", {
		entities: {
			"testinguser_jheg38-sdfh34-sdf7-sdfhg": {
				user: "testinguser",
				item: "jheg38-sdfh34-sdf7-sdfhg",
				type: constants.TYPE_TEXTREL,
				roles: [constants.ROLE_MENTIONED]
			},
			"jheg38-sdfh34-sdf7-sdfhg": {
				id: "jheg38-sdfh34-sdf7-sdfhg",
				body: "@testinguser hi",
				type: constants.TYPE_TEXT,
				creator: "sbtestinguser",
				parents:[["hsdgf834-sdhf384-sdfuh34"]]
			}
		}
	}, (err, changes) => {
		console.log(changes)
	})
})