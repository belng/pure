/* eslint-env: jest */

jest.autoMockOff();

console.log("Starting");

const entity = require("../entity"),
	Constants = require("../../../lib/constants.json");



describe ("Entity insert/update", () => {
	it ("insert room", () => {
		expect(entity({
			id: "43b2bbd2-d041-4771-9907-7b77dd1fb187",
			name: "bangalore",
			body: "",
			type: Constants.TYPE_ROOM,
			tags: [ Constants.TAG_ROOM_CITY ],
			meta: {},
			params: {},
			parents: [],
			creator: "",
			updater: "",
			createTime: 93784
		})).toEqual({});
	});
	it ("update room", () => {
		expect(entity({
			id: "43b2bbd2-d041-4771-9907-7b77dd1fb187",
			name: "bangalore",
			body: "",
			type: Constants.TYPE_ROOM,
			tags: [ Constants.TAG_ROOM_CITY ],
			meta: {},
			params: {},
			parents: [],
			creator: "",
			updater: ""
		})).toEqual({});
	});
});