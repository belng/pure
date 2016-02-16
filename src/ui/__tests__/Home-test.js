/* eslint-env jest */
/* eslint-disable import/no-commonjs */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

jest.dontMock('../components/views/Hello');

const Home = require('../components/views/Home').default;

describe('Home', () => {
	it("renders 'Hello world' message", () => {
		// Render a the app in the document
		const app = TestUtils.renderIntoDocument(<Home />);
		const appNode = ReactDOM.findDOMNode(app);

		// Verify the message is displayed
		expect(appNode.textContent).toEqual('Hello world :)');
	});
});
