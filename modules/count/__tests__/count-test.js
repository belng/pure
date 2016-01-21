"use strict";

jest.autoMockOff();

let core = require("../../../core"),
	assert = require('assert'),
	constants = require("../../../lib/constants"),
	bus = core.bus,
	cache = core.cache;
//let count = require("../count");

describe("incriment count", () => {
	let count = require("../count");
	it("should add count+ to parents and user on new text", () => {
		bus.emit("setstate", {
			entities: {
				"sd23d-d23dasd-ad23-dawe": {
					id: "sd23d-d23dasd-ad23-dawe",
					type: constants.TYPE_TEXT,
					parents: [["sdf87sd-sdf6-xv6-xcvx7843d", "sjfk34-sf9s-sdf43-amv-sdjfh34"]],
					body: "this is a text message 1",
					tags: [constants.TAG_POST_STICKY],
					createtime: Date.now(),
					creator: "testinguser"
				}
			}
		}, (err, changes) => {
			console.log("changes", changes.entities["testinguser"]);
			assert.deepEqual(changes.entities["sdf87sd-sdf6-xv6-xcvx7843d"], {
				 counts: { children: 1 },
				 id: 'sdf87sd-sdf6-xv6-xcvx7843d',
				 type: constants.TYPE_THREAD
			});
			assert.deepEqual(changes.entities["testinguser"], { counts: { texts: 1 }, id: 'testinguser' })
		})
	});

	it("should add count+ to parents and user on new thread", () => {
		bus.emit("setstate", {
			entities: {
				"sdf87sd-sdf6-xv6-xcvx7843d": {
					id: "sdf87sd-sdf6-xv6-xcvx7843d",
					type: constants.TYPE_THREAD,
					parents: [["sjfk34-sf9s-sdf43-amv-sdjfh34"]],
					body: "this is a text message",
					name: "this is a thread title",
					tags: [constants.TAG_POST_STICKY],
					createtime: Date.now(),
					creator: "testinguser",
				}
			}
		}, (err, changes) => {
			console.log(changes.entities)
			assert.deepEqual(changes.entities["sjfk34-sf9s-sdf43-amv-sdjfh34"], {
				counts: { children: 1 },
			 	id: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
			 	type: 1
			});
			assert.deepEqual(changes.entities["testinguser"], {counts: { threads: 1 }, id: 'testinguser'});
		})
			
	});

	it("should add count- to parents and user on delete text", () => {
		bus.emit("setstate", {
			entities: {
				"sd23d-d23dasd-ad23-dawe": {
					id: "sd23d-d23dasd-ad23-dawe",
					type: constants.TYPE_TEXT,
					parents: [["sdf87sd-sdf6-xv6-xcvx7843d", "sjfk34-sf9s-sdf43-amv-sdjfh34"]],
					body: "this is a text message 1",
					tags: [constants.TAG_POST_STICKY],
					deletetime: Date.now(),
					creator: "testinguser"
				}
			}
		}, (err, changes) => {
			console.log(changes.entities["testinguser"]);
			assert.deepEqual(changes.entities["sdf87sd-sdf6-xv6-xcvx7843d"], {
				 counts: { children: -1 },
				 id: 'sdf87sd-sdf6-xv6-xcvx7843d',
				 type: constants.TYPE_THREAD
			});
			assert.deepEqual(changes.entities["testinguser"], { counts: { texts: -1 }, id: 'testinguser' })
		})
	});
	
	it("should add count- to parents and user on delete thread", () => {
		bus.emit("setstate", {
			entities: {
				"sdf87sd-sdf6-xv6-xcvx7843d": {
					id: "sdf87sd-sdf6-xv6-xcvx7843d",
					type: constants.TYPE_THREAD,
					parents: [["sjfk34-sf9s-sdf43-amv-sdjfh34"]],
					body: "this is a text message",
					name: "this is a thread title",
					tags: [constants.TAG_POST_STICKY],
					deletetime: Date.now(),
					creator: "testinguser",
				}
			}
		}, (err, changes) => {
			console.log(changes.entities)
			assert.deepEqual(changes.entities["sjfk34-sf9s-sdf43-amv-sdjfh34"], {
				counts: { children: -1 },
			 	id: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
			 	type: 1
			});
			assert.deepEqual(changes.entities["testinguser"], {counts: { threads: -1 }, id: 'testinguser'});
		})
	});
	
	it("should add follower count to related item", () => {
		bus.emit("setstate", {
			entities: {
				"testinguser_scrollback": {
					user: "testinguser",
					item: "sjfk34-sf9s-sdf43-amv-sdjfh34",
					type: constants.TYPE_ROOMREL,
					role: constants.ROLE_FOLLOWER
				}
			}
		}, (err, changes) => {
			console.log(changes.entities)
			assert.deepEqual(changes.entities["sjfk34-sf9s-sdf43-amv-sdjfh34"], {
				id: "sjfk34-sf9s-sdf43-amv-sdjfh34",
				type: constants.TYPE_ROOM,
				counts: {follower: 1}
			});
		})
	});
	
	it("should remove 1 follower count of related item", () => {
		cache.put({
			entities: {
				"testinguser_scrollback": {
					id: "testinguser_scrollback",
					user: "testinguser",
					item: "sjfk34-sf9s-sdf43-amv-sdjfh34",
					type: constants.TYPE_ROOMREL,
					role: constants.ROLE_FOLLOWER 
				}
			}
		});
		
		bus.emit("setstate", {
			entities: {
				"testinguser_scrollback": {
					user: "testinguser",
					item: "sjfk34-sf9s-sdf43-amv-sdjfh34",
					type: constants.TYPE_ROOMREL,
					role: constants.ROLE_NONE
				}
			}
		}, (err, changes) => {
			console.log(changes.entities)
			assert.deepEqual(changes.entities["sjfk34-sf9s-sdf43-amv-sdjfh34"], {
				id: "sjfk34-sf9s-sdf43-amv-sdjfh34",
				type: constants.TYPE_ROOM,
				counts: {follower: -1}
			});
		})
	});
	
	it("should remove 1 follower count and add banned to related item", () => {
		cache.put({
			entities: {
				"testinguser_scrollback": {
					id: "testinguser_scrollback",
					user: "testinguser",
					item: "sjfk34-sf9s-sdf43-amv-sdjfh34",
					type: constants.TYPE_ROOMREL,
					role: constants.ROLE_FOLLOWER 
				}
			}
		});
		
		bus.emit("setstate", {
			entities: {
				"testinguser_scrollback": {
					user: "testinguser",
					item: "sjfk34-sf9s-sdf43-amv-sdjfh34",
					type: constants.TYPE_ROOMREL,
					role: constants.ROLE_BANNED
				}
			}
		}, (err, changes) => {
			console.log(changes.entities)
			assert.deepEqual(changes.entities["sjfk34-sf9s-sdf43-amv-sdjfh34"], {
				id: "sjfk34-sf9s-sdf43-amv-sdjfh34",
				type: constants.TYPE_ROOM,
				counts: {follower: -1, banned: 1}
			});
		})
	});
	
	it("should remove 1 banned count and add follower to related item", () => {
		cache.put({
			entities: {
				"testinguser_scrollback": {
					id: "testinguser_scrollback",
					user: "testinguser",
					item: "sjfk34-sf9s-sdf43-amv-sdjfh34",
					type: constants.TYPE_ROOMREL,
					role: constants.ROLE_BANNED 
				}
			}
		});
		
		bus.emit("setstate", {
			entities: {
				"testinguser_scrollback": {
					user: "testinguser",
					item: "sjfk34-sf9s-sdf43-amv-sdjfh34",
					type: constants.TYPE_ROOMREL,
					role: constants.ROLE_FOLLOWER
				}
			}
		}, (err, changes) => {
			console.log(changes.entities)
			assert.deepEqual(changes.entities["sjfk34-sf9s-sdf43-amv-sdjfh34"], {
				id: "sjfk34-sf9s-sdf43-amv-sdjfh34",
				type: constants.TYPE_ROOM,
				counts: {follower: 1, banned: -1}
			});
		})
	})

});
