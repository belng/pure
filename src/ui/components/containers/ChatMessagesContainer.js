/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import type { SubscriptionRange } from '../../../modules/store/ConnectTypes';

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
		const {
			start,
			before,
			after
		} = this.state;

		return (
			<Connect
				mapSubscriptionToProps={{
					texts: {
						key: {
							slice: {
								type: 'text',
								filter: {
									thread: this.props.thread
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
				}}
				passProps={{ ...this.props, loadMore: this._loadMore }}
				component={Dummy}
			/>
		);
	}
}

ChatMessagesContainer.propTypes = {
	thread: PropTypes.string.isRequired
};
