/* @flow */

import React, { Component } from 'react';
import shallowEqual from 'shallowequal';
import AvatarRound from './AvatarRound';

export default class UserIcon extends Component<void, any, void> {

	shouldComponentUpdate(nextProps: any): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return <AvatarRound {...this.props} />;
	}
}
