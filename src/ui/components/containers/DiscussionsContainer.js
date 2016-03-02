/* @flow */

import React, { Component } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import type { SubscriptionRange } from '../../../modules/store/ConnectTypes';

export default class DiscussionsContainer extends Component<void, any, SubscriptionRange> {
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
			>
				<Dummy {...this.props} loadMore={this._loadMore} />
			</Connect>
		);
	}
}

DiscussionsContainer.propTypes = {
	room: React.PropTypes.string.isRequired,
};
