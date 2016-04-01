/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import AppText from './AppText';
import AppbarTouchable from './AppbarTouchable';
import type { Thread } from '../../../lib/schemaTypes';

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
	thread: ?Thread | { type: 'loading' };
	relations: number;
	onNavigation: Function;
}

export default class ChatTitle extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.shape({
			name: PropTypes.string
		}),
		relations: PropTypes.number.isRequired,
		onNavigation: PropTypes.func.isRequired
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

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

	render() {
		const {
			thread,
			relations
		} = this.props;

		let title;

		if (thread && thread.type === 'loading') {
			title = 'Loading…';
		} else if (thread && thread.name) {
			title = thread.name;
		} else {
			title = '…';
		}

		return (
			<AppbarTouchable onPress={this._handlePress} style={styles.container}>
				<View style={styles.container}>
					<AppText numberOfLines={1} style={styles.title}>
						{title}
					</AppText>
					<AppText numberOfLines={1} style={styles.subtitle}>
						{relations} {relations === 1 ? ' person' : ' people'} talking
					</AppText>
				</View>
			</AppbarTouchable>
		);
	}
}
