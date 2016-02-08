/* eslint-env jest */

jest.dontMock("../StoreConnect");
jest.dontMock("../StoreProvider");

import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-addons-test-utils";

const StoreConnect = require("../StoreConnect").default;
const StoreProvider = require("../StoreProvider").default;

describe("StoreConnect", () => {
	it("should render connected component with no data", () => {
		const ConnectedComponent = StoreConnect()(() => <span>Hey!</span>); // eslint-disable-line

		const app = TestUtils.renderIntoDocument(
			<StoreProvider store={{}}>
				<ConnectedComponent />
			</StoreProvider>
		);

		const appNode = ReactDOM.findDOMNode(app);

		expect(appNode.textContent).toEqual("Hey!");
	});

	it("should update connected component with data", () => {
		const ConnectedComponent = StoreConnect({
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
			<StoreProvider store={store}>
				<ConnectedComponent />
			</StoreProvider>
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
		const ConnectedComponent = StoreConnect({ textContent: "text" })(({ textContent }) => <span>{textContent}</span>); // eslint-disable-line

		const store = {
			watch: name => name === "text" && { clear },
		};

		ReactDOM.render(
			<StoreProvider store={store}>
				<ConnectedComponent />
			</StoreProvider>,
			container
		);

		ReactDOM.unmountComponentAtNode(container);

		expect(clear).toBeCalled();
	});
});
