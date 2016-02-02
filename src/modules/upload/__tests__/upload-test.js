jest.autoMockOff();

require("../upload");
let core = require("../../../core").bus;


describe("Generate policies", function() {
	it("generate policies for 'avatar' type upload", function() {
		core.emit("upload/getPolicy", {
			user: {
				id: "heyneighbor"
			},
			uploadType: "avatar",
			textId: ""
		}, function(err, payload) {
			expect(payload.response).toEqual({});
		});
	});

	it("generate policies for 'banner' type upload", function() {
		core.emit("upload/getPolicy", {
			user: {
				id: "heyneighbor"
			},
			uploadType: "banner",
			textId: ""
		}, function(err, payload) {
			expect(payload.response).toEqual({});
		});
	});

	it("generate policies for 'content' type upload", function() {
		core.emit("upload/getPolicy", {
			user: {
				id: "heyneighbor"
			},
			uploadType: "content",
			textId: "df37y32-h87er-efewrywe-we"
		}, function(err, payload) {

			expect(payload.response).toEqual({});
		});
	});
})
