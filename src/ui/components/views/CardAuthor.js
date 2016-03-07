/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import Colors from '../../Colors';
import AppText from './AppText';
import AvatarRound from './AvatarRound';

const {
	StyleSheet,
	View
} = ReactNative;

const styles = StyleSheet.create({
	author: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	name: {
		flex: 1,
		color: Colors.grey,
		fontSize: 12,
		lineHeight: 18,
		marginHorizontal: 8
	}
});

export default class CardAuthor extends Component {
	render() {
		const { nick } = this.props;

		return (
			<View {...this.props} style={[ styles.author, this.props.style ]}>
				<AvatarRound
					size={24}
					nick={nick}
				/>
				<AppText style={styles.name}>{nick}</AppText>
			</View>
		);
	}
}

CardAuthor.propTypes = {
	nick: PropTypes.string.isRequired,
	style: View.propTypes.style
};
