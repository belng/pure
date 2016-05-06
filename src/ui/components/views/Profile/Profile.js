/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import AppText from '../AppText';
import AvatarRound from '../AvatarRound';
import PageLoading from '../PageLoading';
import PageEmpty from '../PageEmpty';
import Colors from '../../../Colors';
import {
	ROLE_HOME,
	ROLE_WORK,
	ROLE_HOMETOWN,
} from '../../../../lib/Constants';
import type { User } from '../../../../lib/schemaTypes';

const {
	Image,
	StyleSheet,
	ScrollView,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
	},

	cover: {
		height: null,
		width: null,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16,
	},

	tint: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		backgroundColor: Colors.primary,
		opacity: 0.7,
	},

	info: {
		padding: 8,
	},

	id: {
		color: Colors.white,
		fontWeight: 'bold',
		fontSize: 24,
		lineHeight: 36,
		textAlign: 'center',
	},

	name: {
		color: Colors.white,
		fontSize: 14,
		lineHeight: 21,
		textAlign: 'center',
		opacity: 0.7,
	},

	avatar: {
		margin: 8,
		elevation: 2,
	},

	header: {
		color: Colors.fadedBlack,
		fontWeight: 'bold',
		fontSize: 12,
		lineHeight: 18,
	},

	text: {
		color: Colors.darkGrey,
		fontSize: 14,
		lineHeight: 21,
	},
});

type Props = {
	user: { type: 'loading' } | User | null;
	places: Array<{
		type: number;
		names: Array<string>;
	}>
}

const PLACE_HEADERS = {
	[ROLE_HOME]: 'HOME',
	[ROLE_WORK]: 'WORK',
	[ROLE_HOMETOWN]: 'HOMETOWN',
};

export default class Profile extends Component<void, Props, void> {
	static propTypes = {
		user: PropTypes.oneOfType([
			PropTypes.oneOf([ 'loading' ]),
			PropTypes.shape({
				id: PropTypes.string,
				meta: PropTypes.shape({
					picture: PropTypes.string,
					description: PropTypes.string,
				}),
			}),
		]),
		places: PropTypes.array.isRequired,
	};

	render() {
		const {
			user,
			places,
		} = this.props;

		if (!user) {
			return <PageEmpty label='Failed to load profile' image='sad' />;
		}

		if (user && user.type === 'loading') {
			return <PageLoading />;
		}

		return (
			<ScrollView contentContainerStyle={styles.container}>
				<Image style={styles.cover} source={require('../../../../../assets/profile-cover.jpg')}>
					<View style={styles.tint} />
					<View style={styles.coverInner}>
						<AvatarRound
							style={styles.avatar}
							user={user.id}
							size={160}
						/>
						<View style={styles.info}>
							<AppText style={styles.id}>{user.id}</AppText>
							{user.name ?
								<AppText style={styles.name}>{user.name}</AppText> :
								null
							}
						</View>
					</View>
				</Image>
				<View style={styles.info}>
					{user.meta && user.meta.description ?
						<View style={styles.info}>
							<AppText style={styles.header}>STATUS MESSAGE</AppText>
							<AppText style={styles.text}>{user.meta.description}</AppText>
						</View> :
						null
					}
					{places.length ? places.map(place => (
						<View key={place.type} style={styles.info}>
							<AppText style={styles.header}>{PLACE_HEADERS[place.type]}</AppText>
							<AppText style={styles.text}>{place.names[0]}</AppText>
						</View>
						)) :
						null
					}
				</View>
			</ScrollView>
		);
	}
}
