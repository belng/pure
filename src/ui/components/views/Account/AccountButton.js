/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import AppbarTouchable from '../AppbarTouchable';
import AppbarIcon from '../AppbarIcon';

const {
	NavigationActions
} = ReactNative;

export default class AccountButton extends Component {
	_handlePress = () => {
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

AccountButton.propTypes = {
	onNavigation: PropTypes.func.isRequired
};
