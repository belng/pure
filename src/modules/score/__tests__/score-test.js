/* eslint-env jest */
'use strict';
jest.autoMockOff();

const { Constants, bus } = require('../../../core');

require('../score');

describe('add score to thread', () => {
	it('should add score on thread update', () => {
		console.log('Constants');

		bus.emit('setstate', {
			entities: {
				'df8s-rbf43-sdfbhj34-dnf3': {
					id: 'df8s-rbf43-sdfbhj34-dnf3',
					type: Constants.TYPE_THREAD,
					parents: [ 'adjgf7f-dsfh3-dsf43-23r' ],
					body: 'some thread title',
					updateTime: Date.now()
				}
			}
		}, (err, changes) => {
			if (err) console.log(err);
			console.log(changes.entities['df8s-rbf43-sdfbhj34-dnf3']);
			expect(changes.entities['df8s-rbf43-sdfbhj34-dnf3']).toEqual({
				id: 'df8s-rbf43-sdfbhj34-dnf3',
				type: 3,
				parents: [ 'adjgf7f-dsfh3-dsf43-23r' ],
				body: 'some thread title',
				updateTime: 1455186644528,
				score: 28.0061552863512
			});
		});
	});
});
