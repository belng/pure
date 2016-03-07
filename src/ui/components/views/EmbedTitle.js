/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import AppText from './AppText';
import Colors from '../../Colors';

const {
	StyleSheet
} = ReactNative;

const styles = StyleSheet.create({
	title: {
		fontWeight: 'bold',
		color: Colors.black
	}
});

export default class EmbedTitle extends Component {
	render() {
		if (this.props.embed.title) {
			return (
				<AppText
					numberOfLines={1}
					{...this.props}
					style={[ styles.title, this.props.style ]}
				>
					{this.props.embed.title}
				</AppText>
			);
		} else {
			return null;
		}
	}
}

EmbedTitle.propTypes = {
	embed: PropTypes.shape({
		title: PropTypes.string
	}).isRequired
};
