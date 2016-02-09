/* eslint-env jest */
/* eslint-disable import/no-commonjs */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

jest.dontMock('../Connect');
jest.dontMock('../Provider');
jest.dontMock('../storeShape');

const Connect = require('../Connect').default;
const Provider = require('../Provider').default;

describe('Connect', () => {
	it('should render connected component with no data', () => {
		const ConnectedComponent = Connect()(() => <span>Hey!</span>); // eslint-disable-line
		const store = {
			watch: () => null,
			dispatch: () => null,
		};
		const app = TestUtils.renderIntoDocument(
			<Provider store={store}>
				<ConnectedComponent />
			</Provider>
		);

		const appNode = ReactDOM.findDOMNode(app);

		expect(appNode.textContent).toEqual('Hey!');
	});

	it('should update connected component with data', () => {
		const ConnectedComponent = Connect({
			firstName: [ 'first', null ],
			lastName: [ 'last', null ],
		})(
			({ firstName, lastName }) => <span>{firstName} {lastName}</span> // eslint-disable-line
		);

		let firstNameCallback;
		let lastNameCallback;

		const store = {
			watch: (name, opts, cb) => {
				switch (name) {
				case 'first':
					firstNameCallback = cb;
					break;
				case 'last':
					lastNameCallback = cb;
					break;
				}
			},

			dispatch: () => null,
		};

		const app = TestUtils.renderIntoDocument(
			<Provider store={store}>
				<ConnectedComponent />
			</Provider>
		);

		const appNode = ReactDOM.findDOMNode(app);

		expect(appNode.textContent).toEqual(' ');
		firstNameCallback('hello');
		expect(appNode.textContent).toEqual('hello ');
		lastNameCallback('world');
		expect(appNode.textContent).toEqual('hello world');
		firstNameCallback('hey');
		expect(appNode.textContent).toEqual('hey world');
	});

	it('should remove listener on unmount', () => {
		const container = document.createElement('div');
		const clear = jest.genMockFunction();
		const ConnectedComponent = Connect({ textContent: [ "text", null ] })(({ textContent }) => <span>{textContent}</span>); // eslint-disable-line
		const store = {
			watch: name => name === 'text' && { clear },
			dispatch: () => null,
		};

		ReactDOM.render(
			<Provider store={store}>
				<ConnectedComponent />
			</Provider>,
			container
		);

		ReactDOM.unmountComponentAtNode(container);

		expect(clear).toBeCalled();
	});

	it('should pass dispatch', () => {
		const TEST_ACTION = { type: 'TEST' };
		const ConnectedComponent = Connect(null, {
			ping: store => () => store.dispatch(TEST_ACTION)
		})(
			({ ping }) => <button onClick={ping} /> // eslint-disable-line
		);
		const dispatch = jest.genMockFunction();
		const store = {
			watch: () => null,
			dispatch,
		};

		const app = TestUtils.renderIntoDocument(
			<Provider store={store}>
				<ConnectedComponent />
			</Provider>
		);

		TestUtils.Simulate.click(
			TestUtils.findRenderedDOMComponentWithTag(app, 'button')
		);

		expect(dispatch).toBeCalledWith(TEST_ACTION);
		expect(dispatch.mock.calls.length).toBe(1);
	});

	it('should pass dispatch and data', () => {
		const ConnectedComponent = Connect({
			label: [ 'label', null ]
		}, {
			click: store => () => store.dispatch({
				type: 'CLICK',
				payload: {
					label: 'Clicked'
				}
			})
		})(
			({ label, click }) => <button onClick={click}>{label}</button> // eslint-disable-line
		);

		let callback;

		const store = {
			watch: (name, opts, cb) => callback = name === 'label' ? cb : null,
			dispatch: action => action.type === 'CLICK' ? callback(action.payload.label) : null,
		};

		const app = TestUtils.renderIntoDocument(
			<Provider store={store}>
				<ConnectedComponent />
			</Provider>
		);

		const appNode = ReactDOM.findDOMNode(app);

		expect(appNode.textContent).toEqual('');
		callback('Click me');
		expect(appNode.textContent).toEqual('Click me');

		TestUtils.Simulate.click(
			TestUtils.findRenderedDOMComponentWithTag(app, 'button')
		);

		expect(appNode.textContent).toEqual('Clicked');
	});
});
