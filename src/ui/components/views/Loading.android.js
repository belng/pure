/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';

const {
	ProgressBarAndroid
} = ReactNative;

type Props = {
	style?: any;
}

export default class Loading extends Component<void, Props, void> {
	static propTypes = {
		style: ProgressBarAndroid.propTypes.style
	};

	_root: Object;

	setNativeProps(nativeProps: any) {
		this._root.setNativeProps(nativeProps);
	}

	render() {
		return <ProgressBarAndroid ref={c => (this._root = c)} style={this.props.style} />;
	}
}
