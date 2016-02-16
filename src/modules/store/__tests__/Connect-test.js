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
		const ConnectedComponent = Connect()(({ text }) => <span>{text}</span>); // eslint-disable-line
		const store = {
			subscribe: () => null,
		};
		const app = TestUtils.renderIntoDocument(
			<Provider store={store}>
				<ConnectedComponent text='Hey!' />
			</Provider>
		);

		const appNode = ReactDOM.findDOMNode(app);

		expect(appNode.textContent).toEqual('Hey!');
	});

	it('should update connected component with data', () => {
		const ConnectedComponent = Connect({
			firstName: 'f',
			middleName: {
				key: 'm',
				transform: name => `'${name}'`
			},
			lastName: {
				key: {
					type: 'l',
				}
			},
		})(
			({ firstName, middleName, lastName }) => <span>{firstName} {middleName} {lastName}</span> // eslint-disable-line
		);

		let firstNameCallback;
		let middleNameCallback;
		let lastNameCallback;

		const store = {
			subscribe: (options, cb) => {
				switch (options.what) {
				case 'f':
					firstNameCallback = cb;
					break;
				case 'm':
					middleNameCallback = cb;
					break;
				case 'l':
					lastNameCallback = cb;
					break;
				}
			},
		};

		const app = TestUtils.renderIntoDocument(
			<Provider store={store}>
				<ConnectedComponent />
			</Provider>
		);

		const appNode = ReactDOM.findDOMNode(app);

		expect(appNode.textContent).toEqual('  ');
		firstNameCallback('first');
		expect(appNode.textContent).toEqual('first  ');
		middleNameCallback('middle');
		expect(appNode.textContent).toEqual('first \'middle\' ');
		lastNameCallback('last');
		expect(appNode.textContent).toEqual('first \'middle\' last');
		middleNameCallback('hey');
		expect(appNode.textContent).toEqual('first \'hey\' last');
	});

	it('should remove subscription on unmount', () => {
		const container = document.createElement('div');
		const remove = jest.genMockFunction();
		const ConnectedComponent = Connect({ textContent: "text" })(({ textContent }) => <span>{textContent}</span>); // eslint-disable-line
		const store = {
			subscribe: options => options.what === 'text' && { remove },
		};

		ReactDOM.render(
			<Provider store={store}>
				<ConnectedComponent />
			</Provider>,
			container
		);

		ReactDOM.unmountComponentAtNode(container);

		expect(remove).toBeCalled();
	});

	it('should pass dispatch', () => {
		const TEST_ACTION = { type: 'TEST' };
		const ConnectedComponent = Connect(null, {
			ping: (props, store) => () => store.dispatch(TEST_ACTION)
		})(
			({ ping }) => <button onClick={ping} /> // eslint-disable-line
		);
		const dispatch = jest.genMockFunction();
		const store = {
			subscribe: () => null,
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
		const ConnectedComponent = Connect(props => ({
			label: props.sub
		}), {
			click: (props, store) => () => store.dispatch({
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
			subscribe: (options, cb) => {
				callback = options.what === 'label' ? cb : null;
				return {
					remove: () => callback = null
				};
			},
			dispatch: action => action.type === 'CLICK' ? callback(action.payload.label) : null,
		};

		const app = TestUtils.renderIntoDocument(
			<Provider store={store}>
				<ConnectedComponent sub='label' />
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
