/* @flow */

import React, { Component, PropTypes } from 'react';
import AppbarTouchable from './AppbarTouchable';
import AppbarIcon from './AppbarIcon';
import Share from '../../modules/Share';
import { convertRouteToURL } from '../../../lib/Route';
import { config } from '../../../core-client';

export default class ShareButton extends Component {
	static propTypes = {
		thread: PropTypes.shape({
			to: PropTypes.string,
			id: PropTypes.string,
			title: PropTypes.string
		})
	};

	_handlePress: Function = () => {
		const { thread } = this.props;

		if (thread) {
			Share.shareItem('Share discussion', config.server.protocol + '//' + config.server.host + convertRouteToURL({
				name: 'chat',
				props: {
					room: thread.to,
					thread: thread.id,
					title: thread.title
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
