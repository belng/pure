/* eslint-env jest */
/* eslint-disable import/no-commonjs */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import Connect from '../Connect';
import Provider from '../Provider';

jest.unmock('../Container');
jest.unmock('../Connect');
jest.unmock('../Provider');
jest.unmock('../storeShape');

describe('Connect', () => {
	it('should render connected component with no data', () => {
		const TextComponent = ({ text }) => <span>{text}</span>; // eslint-disable-line
		const store = {
			subscribe: () => null,
		};
		const app = TestUtils.renderIntoDocument(
			<Provider store={store}>
				<Connect component={TextComponent} passProps={{ text: 'Hey!' }} />
			</Provider>
		);

		const appNode = ReactDOM.findDOMNode(app);

		expect(appNode.textContent).toEqual('Hey!');
	});

	it('should update connected component with data', () => {
		const NameComponent = ({ firstName, middleName, lastName }) => <span>{firstName} {middleName} {lastName}</span>; // eslint-disable-line;

		let firstNameCallback;
		let middleNameCallback;
		let lastNameCallback;

		const store = {
			subscribe: (options, cb) => {
				switch (options.type) {
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
				<Connect
					mapSubscriptionToProps={{
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
					}}
					component={NameComponent}
				/>
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
		const TextComponent = ({ textContent }) => <span>{textContent}</span>; // eslint-disable-line
		const store = {
			subscribe: options => options.type === 'text' && { remove },
		};

		ReactDOM.render(
			<Provider store={store}>
				<Connect mapSubscriptionToProps={{ textContent: 'text' }} component={TextComponent} />
			</Provider>,
			container
		);

		ReactDOM.unmountComponentAtNode(container);

		expect(remove).toBeCalled();
	});

	it('should pass dispatch', () => {
		const TEST_ACTION = { type: 'TEST' };
		const ButtonComponent = ({ ping }) => <button onClick={ping} />; // eslint-disable-line;
		const dispatch = jest.genMockFunction();
		const store = {
			subscribe: () => null,
			dispatch,
		};

		const app = TestUtils.renderIntoDocument(
			<Provider store={store}>
				<Connect
					mapActionsToProps={{
						ping: s => () => s.dispatch(TEST_ACTION)
					}}
					component={ButtonComponent}
				/>
			</Provider>
		);

		TestUtils.Simulate.click(
			TestUtils.findRenderedDOMComponentWithTag(app, 'button')
		);

		expect(dispatch).toBeCalledWith(TEST_ACTION);
		expect(dispatch.mock.calls.length).toBe(1);
	});

	pit('should pass dispatch and data', () => {
		const ButtonComponent = ({ initialLabel, label, click }) => <button onClick={click}>{label || initialLabel}</button>; // eslint-disable-line

		let callback;

		const store = {
			subscribe: (options, cb) => {
				console.log(options);
				callback = options.type === 'label' ? cb : null;
				return {
					remove: () => (callback = null)
				};
			},
			dispatch: action => action.type === 'CLICK' ? callback(action.payload.label) : null,
		};

		const TestComponent = ({ sub }) => (
			<Connect
				mapSubscriptionToProps={{
					label: {
						key: sub
					}
				}}
				mapActionsToProps={{
					click: s => () => s.dispatch({
						type: 'CLICK',
						payload: {
							label: 'Clicked'
						}
					})
				}}
				passProps={{ initialLabel: 'Hello' }}
				component={ButtonComponent}
			/>
		);

		const app = TestUtils.renderIntoDocument(
			<Provider store={store}>
				<TestComponent sub='label' />
			</Provider>
		);

		const appNode = ReactDOM.findDOMNode(app);

		expect(appNode.textContent).toEqual('Hello');
		callback('Click me');
		expect(appNode.textContent).toEqual('Click me');

		TestUtils.Simulate.click(
			TestUtils.findRenderedDOMComponentWithTag(app, 'button')
		);

		expect(appNode.textContent).toEqual('Clicked');
	});
});
