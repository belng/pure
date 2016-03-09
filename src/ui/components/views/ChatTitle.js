/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import AppText from './AppText';
import AppbarTouchable from './AppbarTouchable';
import type { Item } from '../../../lib/schemaTypes';

const {
	StyleSheet,
	View,
	NavigationActions
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		marginRight: 64,
		height: 56,
		justifyContent: 'center'
	},
	title: {
		color: Colors.white,
		fontWeight: 'bold'
	},
	subtitle: {
		color: Colors.fadedWhite,
		fontSize: 12,
		lineHeight: 18,
		width: 160
	}
});

type Props = {
	thread: ?Item;
	onNavigation: Function;
}

export default class ChatTitle extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.shape({
			name: PropTypes.string
		}),
		onNavigation: PropTypes.func.isRequired
	};

	_handlePress: Function = () => {
		const { thread } = this.props;

		if (thread && thread.id) {
			this.props.onNavigation(new NavigationActions.Push({
				name: 'details',
				props: {
					thread: thread.id
				}
			}));
		}
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const { thread } = this.props;

		let title = '…',
			concerns = 1;

		if (thread && thread.name) {
			title = thread.name;
			concerns = thread.concerns && thread.concerns.length ? thread.concerns.length : 1;
		} else {
			title = 'Loading…';
		}

		return (
			<AppbarTouchable onPress={this._handlePress} style={styles.container}>
				<View style={styles.container}>
					<AppText numberOfLines={1} style={styles.title}>
						{title}
					</AppText>
					<AppText numberOfLines={1} style={styles.subtitle}>
						{concerns} {concerns > 1 ? ' people' : ' person'} talking
					</AppText>
				</View>
			</AppbarTouchable>
		);
	}
}
