/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import Colors from '../../Colors';
import AppText from './AppText';

const {
	StyleSheet
} = ReactNative;

const styles = StyleSheet.create({
	title: {
		fontWeight: 'bold',
		color: Colors.darkGrey
	}
});

export default class CardTitle extends Component {
	render() {
		return (
			<AppText
				{...this.props}
				style={[ styles.title, this.props.style ]}
				numberOfLines={2}
			>
				{this.props.children}
			</AppText>
		);
	}
}

CardTitle.propTypes = {
	children: PropTypes.string.isRequired,
	style: AppText.propTypes.style
};
