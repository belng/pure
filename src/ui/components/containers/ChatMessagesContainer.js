/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import ChatMessages from '../views/ChatMessages';
import type { SubscriptionRange } from '../../../modules/store/ConnectTypes';

const transformTexts = texts => {
	const data = [];

	for (let l = texts.length - 1, i = l; i >= 0; i--) {
		if (texts[i].type === 'loading') {
			data.push(texts[i]);
		} else {
			data.push({
				text: texts[i],
				previousText: texts[i + 1],
				isFirst: i === 0,
				isLast: i === l,
			});
		}
	}

	return data;
};

export default class ChatMessagesContainer extends Component<void, any, SubscriptionRange> {
	state: SubscriptionRange = {
		start: Infinity,
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
					data: {
						key: {
							slice: {
								type: 'text',
								filter: {
									parents_cts: [ this.props.thread ]
								},
								order: 'createTime'
							},
							range: {
								start,
								before,
								after
							}
						},
						transform: transformTexts
					}
				}}
				passProps={{ ...this.props, loadMore: this._loadMore }}
				component={ChatMessages}
			/>
		);
	}
}

ChatMessagesContainer.propTypes = {
	thread: PropTypes.string.isRequired,
	user: PropTypes.string.isRequired,
};
