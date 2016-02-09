/* eslint-env jest */

jest.dontMock("../Connect");
jest.dontMock("../Provider");
jest.dontMock("../storeShape");

import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-addons-test-utils";

const Connect = require("../Connect").default;
const Provider = require("../Provider").default;

describe("Connect", () => {
	it("should render connected component with no data", () => {
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

		expect(appNode.textContent).toEqual("Hey!");
	});

	it("should update connected component with data", () => {
		const ConnectedComponent = Connect({
			firstName: [ "first", null ],
			lastName: [ "last", null ],
		})(
			({ firstName, lastName }) => <span>{firstName} {lastName}</span> // eslint-disable-line
		);

		let firstNameCallback;
		let lastNameCallback;

		const store = {
			watch: (name, opts, cb) => {
				switch (name) {
				case "first":
					firstNameCallback = cb;
					break;
				case "last":
					lastNameCallback = cb;
					break;
				}
			},

			dispatch: () => null,
		};

		// Render a the app in the document
		const app = TestUtils.renderIntoDocument(
			<Provider store={store}>
				<ConnectedComponent />
			</Provider>
		);

		const appNode = ReactDOM.findDOMNode(app);

		expect(appNode.textContent).toEqual(" ");
		firstNameCallback("hello");
		expect(appNode.textContent).toEqual("hello ");
		lastNameCallback("world");
		expect(appNode.textContent).toEqual("hello world");
		firstNameCallback("hey");
		expect(appNode.textContent).toEqual("hey world");
	});

	it("should remove listener on unmount", () => {
		const container = document.createElement("div");
		const clear = jest.genMockFunction();
		const ConnectedComponent = Connect({ textContent: [ "text", null ] })(({ textContent }) => <span>{textContent}</span>); // eslint-disable-line
		const store = {
			watch: name => name === "text" && { clear },
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
});
