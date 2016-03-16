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

type State = {
	range: SubscriptionRange;
	defer: boolean;
}

export default class ChatMessagesContainer extends Component<void, any, State> {
	state: State = {
		range: {
			start: Infinity,
			before: 20,
			after: 0,
		},
		defer: true,
	};

	componentWillUpdate() {
		if (this.state.defer) {
			this.setState({ defer: false });
		}
	}

	_loadMore: Function = (count: number) => {
		const { range } = this.state;
		const { before } = range;

		this.setState({
			range: {
				...range,
				before: before && before > (count + 20) ? before : count + 20,
			}
		});
	};

	render() {
		const {
			range,
			defer
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
							range,
						},
						transform: transformTexts,
						defer,
					}
				}}
				passProps={{ ...this.props, loadMore: count => this._loadMore(count) }}
				component={ChatMessages}
			/>
		);
	}
}

ChatMessagesContainer.propTypes = {
	thread: PropTypes.string.isRequired,
	user: PropTypes.string.isRequired,
};
