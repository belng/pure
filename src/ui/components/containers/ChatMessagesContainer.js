/* @flow */

import React, { Component } from 'react';
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

export default class ChatMessagesContainer extends Component {
	// Keep state flat for shallowEqual
	state: SubscriptionRange = {
		start: null,
		before: 20,
		after: 0
	};

	_loadMore: Function = (count: number) => {
		this.setState({
			start: null,
			before: count + 20,
			after: 0
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
