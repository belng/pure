/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import ChatMessages from '../views/ChatMessages';
import type { SubscriptionRange } from '../../../modules/store/ConnectTypes';

class ChatMessagesContainerInner extends Component<void, any, void> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
		thread: PropTypes.object
	};

	render() {
		const {
			thread,
			data
		} = this.props;

		let newdata;

		if (thread && thread.type !== 'loading') {
			newdata = [];

			for (let i = 0, l = data.length; i < l; i++) {
				const item = data[i];

				if (i !== l - 1 || typeof item.type === 'string') {
					newdata.push(item);
				} else {
					newdata.push({
						text: item.text,
						previousText: thread,
						isLast: false
					});
				}
			}

			newdata.push({ text: thread });
		} else {
			newdata = data;
		}

		return (
			<ChatMessages
				{...this.props}
				data={newdata}
			/>
		);
	}
}

const transformTexts = texts => {
	const data = [];

	for (let l = texts.length - 1, i = l; i >= 0; i--) {
		if (texts[i].type === 'loading') {
			data.push(texts[i]);
		} else {
			data.push({
				text: texts[i],
				previousText: texts[i + 1],
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
	static propTypes = {
		thread: PropTypes.string.isRequired,
		user: PropTypes.string.isRequired,
	};

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
					},
					thread: {
						key: {
							type: 'entity',
							id: this.props.thread
						}
					}
				}}
				passProps={{ ...this.props, loadMore: count => this._loadMore(count) }}
				component={ChatMessagesContainerInner}
			/>
		);
	}
}
