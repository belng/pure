/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import AppbarTouchable from './AppbarTouchable';
import AppbarIcon from './AppbarIcon';
import Share from '../../modules/Share';
import { convertRouteToURL } from '../../../lib/Route';
import { config } from '../../../core-client';

type Props = {
	thread: {
		id: string;
		parents: Array<string>;
		name: string;
	};
}

export default class ShareButton extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.shape({
			id: PropTypes.string.isRequired,
			parents: PropTypes.arrayOf(PropTypes.string).isRequired,
			name: PropTypes.string.isRequired
		})
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	_handlePress: Function = () => {
		const { thread } = this.props;

		if (thread) {
			Share.shareItem('Share discussion', config.server.protocol + '//' + config.server.host + convertRouteToURL({
				name: 'chat',
				props: {
					room: thread.parents[0],
					thread: thread.id,
					title: thread.name
				}
			}));
		}
	};

	render() {
		return (
			<AppbarTouchable onPress={this._handlePress}>
				<AppbarIcon name='share' />
			</AppbarTouchable>
		);
	}
}
