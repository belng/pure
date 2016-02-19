/* @flow */

import React, { Component } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import type { SubscriptionRange } from '../../../modules/store/ConnectTypes';

const DiscussionsContainerInner = Connect(({ room, start, before, after }) => ({
	threads: {
		key: {
			slice: {
				type: 'threads',
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

export default class DiscussionsContainer extends Component {
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
			<DiscussionsContainerInner
				{...this.props}
				{...this.state}
				loadMore={this._loadMore}
			/>
		);
	}
}
