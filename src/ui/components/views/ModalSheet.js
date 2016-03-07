/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import Colors from '../../Colors';

const {
	StyleSheet,
	View
} = ReactNative;

const styles = StyleSheet.create({
	sheet: {
		backgroundColor: Colors.white,
		elevation: 16
	}
});

type Props = {
	children?: Element;
	style?: any;
}

export default class ModalSheet extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.node.isRequired,
		style: View.propTypes.style
	};

	render() {
		return (
			<View {...this.props} style={[ styles.sheet, this.props.style ]}>
				{this.props.children}
			</View>
		);
	}
}
