/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import Colors from '../../Colors';
import AppText from './AppText';

const {
	StyleSheet,
	View
} = ReactNative;

const styles = StyleSheet.create({
	titleContainer: {
		flex: 1,
		marginVertical: 15,
		marginHorizontal: 4,
		marginRight: 64
	},
	titleText: {
		color: Colors.darkGrey,
		fontWeight: 'bold',
		fontSize: 18,
		lineHeight: 27,
		paddingHorizontal: 4
	}
});

export default class AppbarTitle extends Component {
	static propTypes = {
		children: PropTypes.string.isRequired,
		style: View.propTypes.style,
		textStyle: AppText.propTypes.style
	};

	render() {
		return (
			<View {...this.props} style={[ styles.titleContainer, this.props.style ]}>
				<AppText style={[ styles.titleText, this.props.textStyle ]} numberOfLines={1}>
					{this.props.children}
				</AppText>
			</View>
		);
	}
}
