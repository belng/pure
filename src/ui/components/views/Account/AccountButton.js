/* @flow */

import React, { Component, PropTypes } from 'react';
import AppbarTouchable from '../AppbarTouchable';
import AppbarIcon from '../AppbarIcon';
import NavigationActions from '../../../navigation-rfc/Navigation/NavigationActions';

type Props = {
	onNavigation: Function;
}

export default class AccountButton extends Component<void, Props, void> {
	static propTypes = {
		onNavigation: PropTypes.func.isRequired,
	};

	_handlePress: Function = () => {
		this.props.onNavigation(new NavigationActions.Push({ name: 'account' }));
	};

	render() {
		return (
			<AppbarTouchable onPress={this._handlePress}>
				<AppbarIcon name='menu' />
			</AppbarTouchable>
		);
	}
}
