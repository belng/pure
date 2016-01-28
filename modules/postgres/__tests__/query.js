/* eslint-env: jest */

jest.autoMockOff();

console.log("Starting");

const query = require("../query"),
	Constants = require("../../../lib/constants.json");


describe ("Query", () => {
	it ("bounds query", () => {
		expect(query({
			type: "room",
			join: { "rel": "room" },
			order: "createTime",
			filter: { firstParent: "asdf" }
		}, [764, 974])).toEqual({});
	});
	it ("before/after query", () => {
		expect(query({
			type: "room",
			join: { "rel": "room" },
			order: "createTime",
			filter: { firstParent: "asdf", roleGt: "none" }
		}, [764, 25, 25])).toEqual({});
	});
});
