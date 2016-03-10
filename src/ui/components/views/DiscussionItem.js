/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import NotificationBadgeContainer from '../containers/NotificationBadgeContainer';
import Card from './Card';
import CardTitle from './CardTitle';
import DiscussionSummary from './DiscussionSummary';
import DiscussionFooter from './DiscussionFooter';
import TouchFeedback from './TouchFeedback';
import Modal from './Modal';
import Icon from './Icon';
import Share from '../../modules/Share';
import { convertRouteToURL } from '../../../lib/Route';
import { config } from '../../../core-client';
import { TAG_POST_HIDDEN } from '../../../lib/Constants';
import type { Item } from '../../../lib/schemaTypes';

const {
	Clipboard,
	Linking,
	ToastAndroid,
	StyleSheet,
	TouchableOpacity,
	NavigationActions,
	View
} = ReactNative;

const styles = StyleSheet.create({
	item: {
		marginHorizontal: 16
	},
	footer: {
		marginVertical: 12
	},
	topArea: {
		flexDirection: 'row'
	},
	title: {
		flex: 1,
		marginTop: 16
	},
	badge: {
		margin: 12
	},
	expand: {
		marginHorizontal: 16,
		marginVertical: 12,
		color: Colors.fadedBlack
	},
	hidden: {
		opacity: 0.3
	}
});

type Props = {
	thread: Item;
	hidden?: boolean;
	onNavigation: Function;
}

export default class DiscussionItem extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			body: PropTypes.string.isRequired,
			creator: PropTypes.string.isRequired,
			parents: PropTypes.arrayOf(PropTypes.string).isRequired
		}).isRequired,
		hidden: PropTypes.bool,
		onNavigation: PropTypes.func.isRequired,
		// user: PropTypes.string.isRequired,
		// isUserAdmin: PropTypes.bool.isRequired,
		// isCreatorBanned: PropTypes.bool.isRequired,
		// hideText: PropTypes.func.isRequired,
		// unhideText: PropTypes.func.isRequired,
		// banUser: PropTypes.func.isRequired,
		// unbanUser: PropTypes.func.isRequired
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	_copyToClipboard: Function = text => {
		Clipboard.setString(text);
		ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
	};

	_handleShowMenu: Function = () => {
		const { thread } = this.props;
		const menu = {};

		menu['Copy title'] = () => this._copyToClipboard(thread.name);

		const { meta } = thread;

		if (meta && meta.type === 'photo') {
			menu['Open image in browser'] = () => Linking.openURL(meta.url);
			menu['Copy image link'] = () => this._copyToClipboard(meta.url);
		} else {
			menu['Copy summary'] = () => this._copyToClipboard(thread.body);
		}

		menu['Share discussion'] = () => {
			Share.shareItem('Share discussion', config.server.protocol + '//' + config.server.host + convertRouteToURL({
				name: 'chat',
				props: {
					room: thread.parents[0],
					thread: thread.id,
					title: thread.name
				}
			}));
		};

		// if (this.props.isUserAdmin) {
		// 	if (this.props.hidden) {
		// 		menu['Unhide discussion'] = () => this.props.unhideText();
		// 	} else {
		// 		menu['Hide discussion'] = () => this.props.hideText();
		// 	}
		//
		// 	if (thread.creator !== this.props.user) {
		// 		if (this.props.isCreatorBanned) {
		// 			menu['Unban ' + thread.from] = () => this.props.unbanUser();
		// 		} else {
		// 			menu['Ban ' + thread.from] = () => this.props.banUser();
		// 		}
		// 	}
		// }

		Modal.showActionSheetWithItems(menu);
	};

	_handlePress: Function = () => {
		const { thread } = this.props;

		this.props.onNavigation(new NavigationActions.Push({
			name: 'chat',
			props: {
				thread: thread.id,
				room: thread.parents[0]
			}
		}));
	};

	render() {
		const {
			thread
		} = this.props;

		const hidden = thread.tags && thread.tags.indexOf(TAG_POST_HIDDEN) > -1;

		return (
			<Card {...this.props}>
				<TouchFeedback onPress={this._handlePress}>
					<View style={hidden ? styles.hidden : null}>
						<View style={styles.topArea}>
							<CardTitle style={[ styles.item, styles.title ]}>
								{this.props.thread.name}
							</CardTitle>

							<NotificationBadgeContainer thread={this.props.thread.id} style={styles.badge} />

							<TouchableOpacity onPress={this._handleShowMenu}>
								<Icon
									name='expand-more'
									style={styles.expand}
									size={20}
								/>
							</TouchableOpacity>
						</View>

						<DiscussionSummary text={thread.body} meta={thread.meta} />
						<DiscussionFooter style={[ styles.item, styles.footer ]} thread={thread} />
					</View>
				</TouchFeedback>
			</Card>
		);
	}
}
