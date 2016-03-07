/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import Colors from '../../Colors';
import AppText from './AppText';
import AvatarRound from './AvatarRound';
import TouchFeedback from './TouchFeedback';

const {
	StyleSheet,
	PixelRatio,
	View
} = ReactNative;

const styles = StyleSheet.create({
	item: {
		backgroundColor: Colors.white,
		borderColor: Colors.separator,
		borderBottomWidth: 1 / PixelRatio.get()
	},
	person: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	avatar: {
		marginHorizontal: 16,
		marginVertical: 12
	},
	nick: {
		flex: 1
	},
	nickText: {
		color: Colors.darkGrey
	},
	presence: {
		fontSize: 12,
		lineHeight: 18,
		marginHorizontal: 16,
		paddingHorizontal: 4,
		color: Colors.darkGrey
	},
	online: {
		color: Colors.success,
		fontWeight: 'bold'
	},
	offline: {
		opacity: 0.5
	}
});

export default class PeopleListItem extends Component {
	static propTypes = {
		user: PropTypes.string.isRequired,
		presence: PropTypes.string
	};

	render() {
		const {
			user,
			presence
		} = this.props;

		return (
			<View style={styles.item}>
				<TouchFeedback>
					<View style={styles.person}>
						<AvatarRound
							style={styles.avatar}
							size={36}
							nick={user}
						/>
						<View style={styles.nick}>
							<AppText style={[ styles.nickText, presence !== 'online' ? styles.offline : null ]}>
								{user}
							</AppText>
						</View>
						<View>
							<AppText style={[ styles.presence, presence === 'online' ? styles.online : styles.offline ]}>
								{presence ? presence.toUpperCase() : 'OFFLINE'}
							</AppText>
						</View>
					</View>
				</TouchFeedback>
			</View>
		);
	}
}
