/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Discussions from '../views/Discussions';
import type { SubscriptionRange } from '../../../modules/store/ConnectTypes';

class DiscussionsContainer extends Component<void, any, SubscriptionRange> {
	static propTypes = {
		room: PropTypes.string.isRequired,
		user: PropTypes.string.isRequired,
	};

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
								type: 'thread',
								filter: {
									parents_cts: [ this.props.room ]
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
				component={Discussions}
			/>
		);
	}
}

export default class DiscussionsContainerOuter extends Component<void, { room: string }, void> {
	static propTypes = {
		room: PropTypes.string.isRequired,
	};

	render() {
		return (
			<Connect
				mapSubscriptionToProps={{
					user: {
						key: {
							type: 'state',
							path: 'user'
						}
					}
				}}
				passProps={this.props}
				component={DiscussionsContainer}
			/>
		);
	}
}
