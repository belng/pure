/* eslint-env jest */

jest.autoMockOff();

// const core = require('../../../core-server').bus;
const getResponse = require('./../image-upload').getResponse;

describe('Generate policies', () => {
	it("generate policies for 'content' type upload", () => {
		let req = {
			auth: {
				user: 'harish'
			},
			uploadType: 'content',
			textId: 'df37y32-h87er-efewrywe-we'
		};
		getResponse(req);
	});
});
