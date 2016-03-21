/* eslint-env jest */

jest.autoMockOff();

const core = require('../../../core-server').bus;
require('./../image-upload');

describe('Generate policies', () => {
	it("generate policies for 'avatar' type upload", () => {
		core.emit('upload/getPolicy', {
			user: {
				id: 'heyneighbor'
			},
			uploadType: 'avatar',
			textId: ''
		}, (err, payload) => {
			expect(payload.response).toEqual({});
		});
	});

	it("generate policies for 'banner' type upload", () => {
		core.emit('upload/getPolicy', {
			user: {
				id: 'heyneighbor'
			},
			uploadType: 'banner',
			textId: ''
		}, (err, payload) => {
			expect(payload.response).toEqual({});
		});
	});

	it("generate policies for 'content' type upload", () => {
		core.emit('upload/getPolicy', {
			user: {
				id: 'heyneighbor'
			},
			uploadType: 'content',
			textId: 'df37y32-h87er-efewrywe-we'
		}, (err, payload) => {

			expect(payload.response).toEqual({});
		});
	});
});
