/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import Discussions from '../views/Discussions';
import { TAG_POST_HIDDEN } from '../../../lib/Constants';
import type { SubscriptionRange } from '../../../modules/store/ConnectTypes';

const transformThreads = results => results.filter(item => {
	if (item.tags && item.tags.indexOf(TAG_POST_HIDDEN) > -1) {
		return false;
	}

	return true;
}).reverse();

type State = {
	range: SubscriptionRange;
	defer: boolean;
}

class DiscussionsContainer extends Component<void, any, State> {
	static propTypes = {
		room: PropTypes.string.isRequired,
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

	shouldComponentUpdate(nextProps: any, nextState: State): boolean {
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

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
				before: before && before > (count + 10) ? before : count + 20,
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
								type: 'thread',
								filter: {
									parents_cts: [ this.props.room ]
								},
								order: 'createTime'
							},
							range
						},
						transform: transformThreads,
						defer,
					}
				}}
				passProps={{ ...this.props, loadMore: count => this._loadMore(count) }}
				component={Discussions}
			/>
		);
	}
}

export default PassUserProp(DiscussionsContainer);
