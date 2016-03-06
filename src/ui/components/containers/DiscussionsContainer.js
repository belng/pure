/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Discussions from '../views/Dummy';
import type { SubscriptionRange } from '../../../modules/store/ConnectTypes';

export default class DiscussionsContainer extends Component<void, any, SubscriptionRange> {
	static propTypes = {
		room: PropTypes.string.isRequired,
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
					user: {
						key: {
							type: 'state',
							path: 'user'
						},
					},
					threads: {
						key: {
							slice: {
								type: 'thread',
								filter: {
									room: this.props.room
								},
								order: 'score'
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
