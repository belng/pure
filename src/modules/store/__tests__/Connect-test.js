/* eslint-env jest */

jest.dontMock("../Connect");
jest.dontMock("../Provider");

import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-addons-test-utils";

const Connect = require("../Connect").default;
const Provider = require("../Provider").default;

describe("Connect", () => {
	it("should render connected component with no data", () => {
		const ConnectedComponent = Connect()(() => <span>Hey!</span>); // eslint-disable-line

		const app = TestUtils.renderIntoDocument(
			<Provider store={{}}>
				<ConnectedComponent />
			</Provider>
		);

		const appNode = ReactDOM.findDOMNode(app);

		expect(appNode.textContent).toEqual("Hey!");
	});

	it("should update connected component with data", () => {
		const ConnectedComponent = Connect({
			firstName: "first",
			lastName: "last",
		})(
			({ firstName, lastName }) => <span>{firstName} {lastName}</span> // eslint-disable-line
		);

		let firstNameCallback;
		let lastNameCallback;

		const store = {
			watch: (name, cb) => {
				switch (name) {
				case "first":
					firstNameCallback = cb;
					break;
				case "last":
					lastNameCallback = cb;
					break;
				}
			},
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
		const ConnectedComponent = Connect({ textContent: "text" })(({ textContent }) => <span>{textContent}</span>); // eslint-disable-line

		const store = {
			watch: name => name === "text" && { clear },
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
