/* eslint-env jest */

jest.dontMock('../components/views/Hello');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

const Hello = require('../components/views/Hello').default;

describe('Hello', () => {
	it("renders 'Hello world' message", () => {
		// Render a the app in the document
		const app = TestUtils.renderIntoDocument(<Hello />);
		const appNode = ReactDOM.findDOMNode(app);

		// Verify the message is displayed
		expect(appNode.textContent).toEqual('Hello world :)');
	});
});
