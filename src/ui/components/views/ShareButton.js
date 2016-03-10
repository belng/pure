/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import AppbarTouchable from './AppbarTouchable';
import AppbarIcon from './AppbarIcon';
import Share from '../../modules/Share';

type Props = {
	url: string;
}

export default class ShareButton extends Component<void, Props, void> {
	static propTypes = {
		url: PropTypes.string,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	_handlePress: Function = () => {
		const { url } = this.props;

		if (url) {
			Share.shareItem('Share discussion', url);
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
