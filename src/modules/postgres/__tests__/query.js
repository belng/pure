/* eslint-env: jest */

jest.autoMockOff();

console.log("Starting");

const query = require("../query"),
	Constants = require("../../../../constants/Constants.json");


describe ("Query", () => {
	it ("bounds query", () => {
		expect(query({
			type: "room",
			join: { "rel": "room" },
			order: "createTime",
			filter: { firstParent: "asdf" }
		}, [764, 974])).toEqual({
			$: 'SELECT  row_to_json("rooms.*") as "room",row_to_json("rels.*") as "rel" FROM "rooms" LEFT OUTER JOIN "rels" ON "rels"."room" = "rooms"."id" WHERE "firstParent" = &{firstParent} AND "createTime" >= &{createTimeGte} AND "createTime" <= &{createTimeLte} ORDER BY "createTime" ASC LIMIT 1024',
			createTimeGte: 764,
			createTimeLte: 974,
			firstParent: 'asdf'
    	});
	});

	it ("before/after query", () => {
		expect(query({
			type: "room",
			join: { "rel": "room" },
			order: "createTime",
			filter: { firstParent: "asdf", roleGt: "none" }
		}, [764, 25, 25])).toEqual({
			$: 'SELECT * FROM ( SELECT  row_to_json("rooms.*") as "room",row_to_json("rels.*") as "rel" FROM "rooms" LEFT OUTER JOIN "rels" ON "rels"."room" = "rooms"."id" WHERE "firstParent" = &{firstParent} AND "role" > &{roleGt} AND "createTime" < &{createTimeLt} ORDER BY "createTime" DESC LIMIT 25 ) r ORDER BY "&{type}"->\'&{order}\' ASC UNION ALL SELECT  row_to_json("rooms.*") as "room",row_to_json("rels.*") as "rel" FROM "rooms" LEFT OUTER JOIN "rels" ON "rels"."room" = "rooms"."id" WHERE "firstParent" = &{firstParent} AND "role" > &{roleGt} AND "createTime" >= &{createTimeGte} ORDER BY "createTime" ASC LIMIT 25',
			createTimeGte: 764,
			createTimeLt: 764,
			firstParent: 'asdf',
			order: 'createTime',
			roleGt: 'none',
			type: 'room'
		});
	});
});
