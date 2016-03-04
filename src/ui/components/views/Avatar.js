/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';

const {
	Image
} = ReactNative;

export default class Avatar extends Component {
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
