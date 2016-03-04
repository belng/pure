/* @flow */

import React, { Component, PropTypes, Children } from 'react';
import storeShape from './storeShape';

export default class Container extends Component<void, { children: Element }, void> {
	static contextTypes = {
		store: storeShape.isRequired,
	};

	static propTypes = {
		children: PropTypes.element.isRequired,
	};

	render(): React$Element<any> {
		return React.cloneElement(Children.only(this.props.children), { ...this.props, store: this.context.store });
	}
}
