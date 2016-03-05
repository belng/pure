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
		color: Colors.white,
		fontWeight: 'bold',
		fontSize: 18,
		lineHeight: 27,
		marginVertical: 14,
		marginRight: 64,
		paddingHorizontal: 4
	}
});

export default class RoomTitle extends Component {
	static propTypes = {
		room: PropTypes.shape({
			guides: PropTypes.shape({
				displayName: PropTypes.string.isRequired
			})
		}).isRequired
	};

	render() {
		return (
			<AppText numberOfLines={1} style={styles.title}>
				{this.props.room.guides.displayName}
			</AppText>
		);
	}
}
