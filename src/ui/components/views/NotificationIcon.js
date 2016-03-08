/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import Colors from '../../Colors';
import AppbarTouchable from './AppbarTouchable';
import AppbarIcon from './AppbarIcon';
import NotificationBadgeContainer from '../containers/NotificationBadgeContainer';

const {
	StyleSheet,
	NavigationActions,
	View
} = ReactNative;

const styles = StyleSheet.create({
	badge: {
		position: 'absolute',
		top: 10,
		right: 10,
		backgroundColor: Colors.badge,
		elevation: 2
	}
});

type Props = {
	onNavigation: Function;
}

export default class NotificationIcon extends Component<void, Props, void> {
	static propTypes = {
		onNavigation: PropTypes.func.isRequired
	};

	_handlePress: Function = () => {
		this.props.onNavigation(new NavigationActions.Push({ name: 'notes' }));
	};

	render() {
		return (
			<AppbarTouchable onPress={this._handlePress}>
				<View>
					<AppbarIcon name='notifications' />
					<NotificationBadgeContainer style={styles.badge} grouped />
				</View>
			</AppbarTouchable>
		);
	}
}
