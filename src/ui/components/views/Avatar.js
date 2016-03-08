/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';

const {
	Image
} = ReactNative;

type Props = {
	uri: ?string;
}

export default class Avatar extends Component<void, Props, void> {
	static propTypes = {
		uri: PropTypes.string
	};

	render() {
		if (this.props.uri) {
			return <Image {...this.props} source={{ uri: this.props.uri }} />;
		} else {
			return null;
		}
	}
}
