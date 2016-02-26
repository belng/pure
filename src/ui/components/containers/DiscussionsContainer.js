/* @flow */

import React, { Component } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import type { SubscriptionRange } from '../../../modules/store/ConnectTypes';

const DiscussionsContainerInner = Connect(({ room, start, before, after }) => ({
	threads: {
		key: {
			slice: {
				type: 'thread',
				filter: {
					room
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
}))(Dummy);

DiscussionsContainerInner.propTypes = {
	room: React.PropTypes.string.isRequired,
	start: React.PropTypes.number,
	before: React.PropTypes.number,
	after: React.PropTypes.number,
};

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
		const props = { ...this.props, ...this.state };

		return (
			<DiscussionsContainerInner {...props} loadMore={this._loadMore} />
		);
	}
}
