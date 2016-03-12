/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import Discussions from '../views/Discussions';
import type { SubscriptionRange } from '../../../modules/store/ConnectTypes';

const transformThreads = data => data.reverse();

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
						},
						transform: transformThreads,
					}
				}}
				passProps={{ ...this.props, loadMore: this._loadMore }}
				component={Discussions}
			/>
		);
	}
}

export default PassUserProp(DiscussionsContainer);
