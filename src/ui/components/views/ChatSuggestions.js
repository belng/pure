/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import AppText from './AppText';
import AvatarRound from './AvatarRound';
import type { User } from '../../../lib/schemaTypes';

const {
	StyleSheet,
	PixelRatio,
	TouchableHighlight,
	ScrollView,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	inverted: {
		transform: [
			{ scaleY: -1 },
		],
	},
	item: {
		backgroundColor: Colors.white,
		borderColor: Colors.separator,
		borderTopWidth: 1 / PixelRatio.get(),
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		height: 40,
	},
	user: {
		color: Colors.darkGrey,
		marginHorizontal: 12,
		paddingHorizontal: 4,
	},
});

type Props = {
	data: Array<User>;
	onSelect: Function;
	style?: any;
}

export default class ChatSuggestions extends Component<void, Props, void> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.object),
		onSelect: PropTypes.func.isRequired,
		style: ScrollView.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	_renderUser: Function = (user: User) => (
		<TouchableHighlight
			key={user.id}
			underlayColor={Colors.underlay}
			onPress={() => this.props.onSelect(user)}
		>
			<View style={[ styles.item, styles.inverted ]}>
				<AvatarRound
					user={user.id}
					size={24}
				/>
				<AppText style={styles.user}>{user.id}</AppText>
			</View>
		</TouchableHighlight>
	);

	render() {
		const { data } = this.props;

		if (!data.length) {
			return null;
		}

		return (
			<ScrollView
				{...this.props}
				style={[ data.length > 4 ? { height: 160 } : null, styles.inverted, this.props.style ]}
				keyboardShouldPersistTaps
			>
				{data.map(this._renderUser)}
			</ScrollView>
		);
	}
}
