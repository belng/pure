"use strict";

jest.autoMockOff();

let core = require("../../../core"),
	count = require("../count")(core),
	constants = require("../../../lib/constants"),
	bus = core.bus,
	cache = core.cache;

describe("increase count", () => {
	cache.put({
		entities: {
			"sd23d-d23dasd-ad23-dawe": {
				id: "sd23d-d23dasd-ad23-dawe",
				type: constants.TYPE_TEXT,
				parents: ["sdf87sd-sdf6-xv6-xcvx7843d", "sjfk34-sf9s-sdf43-amv-sdjfh34"],
				body: "this is a text message 1",
				tags: [constants.TAG_POST_STICKY],
				createtime: Date.now(),
				creator: "testinguser"
			}
		}
	});
	cache.put({
		entities: {		
			"lm23d-fd3dasd-mn23-dawe": {
				id: "lm23d-fd3dasd-mn23-dawe",
				type: constants.TYPE_TEXT,
				parents: ["sdf87sd-sdf6-xv6-xcvx7843d", "sjfk34-sf9s-sdf43-amv-sdjfh34"],
				body: "this is a text message 2",
				tags: [constants.TAG_POST_STICKY],
				createtime: Date.now(),
				creator: "testinguser"
			}
		}
	});
	cache.put({
		entities: {	
			"sdf87sd-sdf6-xv6-xcvx7843d": {
				id: "sdf87sd-sdf6-xv6-xcvx7843d",
				type: constants.TYPE_THREAD,
				parents: ["sjfk34-sf9s-sdf43-amv-sdjfh34"],
				body: "this is a text message",
				name: "this is a thread title",
				tags: [constants.TAG_POST_STICKY],
				createtime: Date.now(),
				creator: "testinguser",
				counts: {
					text: 2
				}
			}}
	});
	cache.put({
		entities: {
			"sjfk34-sf9s-sdf43-amv-sdjfh34": {
				id: "sjfk34-sf9s-sdf43-amv-sdjfh34",
				type: constants.TYPE_ROOM,
				name: "scrollback",
				body: "thsi is room dscription",
				tags: [constants.TAG_ROOM_CITY],
				counts: {
					thread: 1,
					text: 2
				},
				createtime: Date.now()
			}}
	});
	cache.put({
		entities: {
			testinguser: {
				id: "testinguser",
				name: "Testinguser",
				identities: ["testinguser@mailinator.com"],
				tags: [constants.TAG_USER_EMAIL],
				timezone: 330,
				resources: {
					scrollback: "online"
				},
				presence: "online",
				counts: {
					room: 1,
					text: 2,
					thread: 1
				},
				createtime: Date.now()
			}
		}
	});
	
	it("should add inc op to counts of all parents and user on text", () => {
		let op = { text: 1, __op__: { text: [ 'inc' ] } };
		bus.emit("setstate", {
			entities: {
				"askdh9-fd3dasd-mn23-dawe": {
					id: "askdh9-fd3dasd-mn23-dawe",
					type: constants.TYPE_TEXT,
					parents: ["sdf87sd-sdf6-xv6-xcvx7843d", "sjfk34-sf9s-sdf43-amv-sdjfh34"],
					body: "this is a text message 3",
					tags: [constants.TAG_POST_STICKY],
					createtime: Date.now(),
					creator: "testinguser"
				},
			}
		}, () => {
			expect(cache.getEntity("testinguser").counts.op).toEqual(op);
			expect(cache.getEntity("sdf87sd-sdf6-xv6-xcvx7843d").counts.op).toEqual(op);
			expect(cache.getEntity("sjfk34-sf9s-sdf43-amv-sdjfh34").counts.op).toEqual(op);
		});
	});
	
	it.only("should add inc op on thread", () => {
		let op = { thread: 1, __op__: { thread: [ "inc" ] } };
		bus.emit("setstate", {
			entities: {
				"askdh9-fd3dasd-mn23-dawe": {
					id: "askdh9-fd3dasd-mn23-dawe",
					type: constants.TYPE_THREAD,
					parents: ["sjfk34-sf9s-sdf43-amv-sdjfh34"],
					body: "this is a 1st text of this thread",
					name: "this is thread title",
					tags: [constants.TAG_POST_STICKY],
					createtime: Date.now(),
					creator: "testinguser"
				},
			}
		}, () => {
			console.log(cache.getEntity("sjfk34-sf9s-sdf43-amv-sdjfh34").counts.op)
			expect(cache.getEntity("testinguser").counts.op).toEqual(op);
			expect(cache.getEntity("sjfk34-sf9s-sdf43-amv-sdjfh34").counts.op).toEqual(op);
		})
	})
});