/* @flow */

import React, { Component, PropTypes } from 'react';
import AppbarTouchable from './AppbarTouchable';
import AppbarIcon from './AppbarIcon';

export default class NotificationClearIcon extends Component {
	static propTypes = {
		dismissAllNotes: PropTypes.func.isRequired
	};

	render() {
		return (
			<AppbarTouchable onPress={this.props.dismissAllNotes}>
				<AppbarIcon name='clear-all' />
			</AppbarTouchable>
		);
	}
}
