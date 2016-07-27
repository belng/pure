/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import ActionSheet from '../Core/ActionSheet';
import ActionSheetItem from '../Core/ActionSheetItem';
import { convertRouteToURL } from '../../../../lib/Route';
import { config } from '../../../../core-client';
import { TAG_POST_HIDDEN } from '../../../../lib/Constants';
import type { Thread, ThreadRel } from '../../../../lib/schemaTypes';

const {
	Clipboard,
	Linking,
	ToastAndroid,
} = ReactNative;

type Props = {
	thread: Thread;
	threadrel: ?ThreadRel;
	isUserAdmin: boolean;
	hideThread: Function;
	unhideThread: Function;
	banUser: Function;
	unbanUser: Function;
}

export default class DiscussionActionSheet extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			body: PropTypes.string.isRequired,
			creator: PropTypes.string.isRequired,
			parents: PropTypes.arrayOf(PropTypes.string).isRequired,
			tags: PropTypes.arrayOf(PropTypes.number),
		}).isRequired,
		threadrel: PropTypes.object,
		isUserAdmin: PropTypes.bool,
		hideThread: PropTypes.func.isRequired,
		unhideThread: PropTypes.func.isRequired,
		banUser: PropTypes.func.isRequired,
		unbanUser: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_copyToClipboard = (text: string) => {
		Clipboard.setString(text);
		ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
	};

	_handleHide = () => {
		const { id, tags } = this.props.thread;
		this.props.hideThread(id, tags);
	};

	_handleUnhide = () => {
		const { id, tags } = this.props.thread;
		this.props.unhideThread(id, tags);
	};

	_handleOpenImage = () => {
		const { thread } = this.props;

		if (thread.meta) {
			const { photo } = thread.meta;

			Linking.openURL(photo.url);
		}
	};

	_handleCopyImageLink = () => {
		const { thread } = this.props;

		if (thread.meta) {
			const { photo } = thread.meta;

			this._copyToClipboard(photo.url);
		}
	};

	_handleCopyTitle = () => {
		this._copyToClipboard(this.props.thread.name);
	};

	_handleCopySummary = () => {
		this._copyToClipboard(this.props.thread.body);
	};

	_handleCopyLink = () => {
		const { thread } = this.props;

		this._copyToClipboard(config.server.protocol + '//' + config.server.host + convertRouteToURL({
			name: 'chat',
			props: {
				room: thread.parents[0],
				thread: thread.id,
				title: thread.name,
			},
		}));
	};

	render() {
		const {
			thread,
			isUserAdmin,
		} = this.props;

		// FIXME: temporary check to avoid crash
		if (!(thread && thread.body && thread.name)) {
			return null;
		}

		const hidden = thread.tags && thread.tags.indexOf(TAG_POST_HIDDEN) > -1;

		return (
			<ActionSheet {...this.props}>
				<ActionSheetItem onPress={this._handleCopyTitle}>
					Copy title
				</ActionSheetItem>

				{thread.meta && thread.meta.photo ? [
					<ActionSheetItem key='open-image' onPress={this._handleOpenImage}>
						Open image in browser
					</ActionSheetItem>,
					<ActionSheetItem key='copy-imagelink' onPress={this._handleCopyImageLink}>
						Copy image link
					</ActionSheetItem>,
				] :
					<ActionSheetItem onPress={this._handleCopySummary}>
						Copy summary
					</ActionSheetItem>
				}

				<ActionSheetItem onPress={this._handleCopyLink}>
					Copy discussion link
				</ActionSheetItem>

				{isUserAdmin ?
					hidden ?
						<ActionSheetItem onPress={this._handleUnhide}>
							Unhide discussion
						</ActionSheetItem> :
						<ActionSheetItem onPress={this._handleHide}>
							Hide discussion
						</ActionSheetItem> : null
				}
			</ActionSheet>
		);
	}
}
