/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import Colors from '../../Colors';
import RichText from './RichText';

const {
	StyleSheet
} = ReactNative;

const styles = StyleSheet.create({
	summary: {
		color: Colors.grey
	}
});

export default class TextSummary extends Component {
	render() {
		return (
			<RichText
				{...this.props}
				style={[ styles.summary, this.props.style ]}
				numberOfLines={3}
				text={this.props.text}
			/>
		);
	}
}

TextSummary.propTypes = {
	text: PropTypes.string.isRequired,
	style: RichText.propTypes.style
};
