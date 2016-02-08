/*
 * Helper component to provide the store to child components
 *
 * Usage: <Provider store={store}><RootComponent /></Provider>
 *
 * @flow
 */

import { Component, Children, PropTypes } from "react";

export default class StoreProvider extends Component {
	static propTypes = {
		children: PropTypes.element.isRequired,
		store: PropTypes.shape({
			watch: PropTypes.func
		}).isRequired
	};

	static childContextTypes = {
		store: PropTypes.object
	};

	getChildContext(): Object {
		return {
			store: this.props.store
		};
	}

	render(): ReactElement {
		return Children.only(this.props.children);
	}
}
