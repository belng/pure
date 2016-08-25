/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from './AppText';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	emojiOnly: {
		textAlign: 'center',
		fontSize: 32,
		lineHeight: 48,
	},
});

type Props = {
	children?: string;
	style?: any;
}

export default class BigEmoji extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.string.isRequired,
		style: AppText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	setNativeProps(nativeProps: any) {
		this._root.setNativeProps(nativeProps);
	}

	_root: Object;

	render() {
		return (
			<AppText
				{...this.props}
				style={[ styles.emojiOnly, this.props.style ]}
				ref={c => (this._root = c)}
			>
				{this.props.children}
			</AppText>
		);
	}
}
