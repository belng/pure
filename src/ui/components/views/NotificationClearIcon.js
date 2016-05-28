/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import AppbarTouchable from './AppbarTouchable';
import AppbarIcon from './AppbarIcon';

type Props = {
	dismissAllNotes: Function;
}

export default class NotificationClearIcon extends Component<void, Props, void> {
	static propTypes = {
		dismissAllNotes: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<AppbarTouchable onPress={this.props.dismissAllNotes}>
				<AppbarIcon name='clear-all' />
			</AppbarTouchable>
		);
	}
}
