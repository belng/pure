/* @flow */

import React, { Component, PropTypes } from 'react';
import AppbarTouchable from '../AppbarTouchable';
import AppbarIcon from '../AppbarIcon';
import NavigationActions from '../../../navigation-rfc/Navigation/NavigationActions';

type Props = {
	user: string;
	onNavigation: Function;
}

export default class ProfileButton extends Component<void, Props, void> {
	static propTypes = {
		user: PropTypes.string.isRequired,
		onNavigation: PropTypes.func.isRequired,
	};

	_handlePress: Function = () => {
		this.props.onNavigation(new NavigationActions.Push({
			name: 'profile',
			props: {
				user: this.props.user,
			},
		}));
	};

	render() {
		return (
			<AppbarTouchable onPress={this._handlePress}>
				<AppbarIcon name='menu' />
			</AppbarTouchable>
		);
	}
}
