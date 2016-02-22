/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import type { SubscriptionRange } from '../../../modules/store/ConnectTypes';

const ChatMessagesContainerInner = Connect(({ thread, start, before, after }) => ({
	texts: {
		key: {
			slice: {
				type: 'text',
				filter: {
					thread
				},
				order: 'createTime'
			},
			range: {
				start,
				before,
				after
			}
		}
	}
}))(Dummy);

ChatMessagesContainerInner.propTypes = {
	thread: PropTypes.string.isRequired,
	start: PropTypes.number,
	before: PropTypes.number,
	after: PropTypes.number,
};

export default class ChatMessagesContainer extends Component<void, any, SubscriptionRange> {
	// Keep state flat for shallowEqual
	state: SubscriptionRange = {
		start: -Infinity,
		before: 20,
		after: 0,
	};

	_loadMore: Function = (count: number) => {
		this.setState({
			before: count + 20,
		});
	};

	render() {
		return (
			<ChatMessagesContainerInner
				{...this.props}
				{...this.state}
				loadMore={this._loadMore}
			/>
		);
	}
}
