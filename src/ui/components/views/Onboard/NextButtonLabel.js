/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import AppText from '../AppText';
import Icon from '../Icon';
import Colors from '../../../Colors';

const {
	View,
	StyleSheet
} = ReactNative;

const styles = StyleSheet.create({
	label: {
		color: Colors.white,
		fontWeight: 'bold',
		margin: 16
	},

	icon: {
		color: Colors.fadedBlack
	}
});

export default class NextButtonLabel extends Component {
	static propTypes = {
		label: PropTypes.string,
		style: View.propTypes.style
	};

	setNativeProps(nativeProps) {
		this._root.setNativeProps(nativeProps);
	}

	render() {
		return (
			<View {...this.props} ref={c => (this._root = c)}>
				<AppText style={styles.label}>{this.props.label.toUpperCase()}</AppText>
				<Icon
					style={styles.icon}
					name='arrow-forward'
					size={16}
				/>
			</View>
		);
	}
}
