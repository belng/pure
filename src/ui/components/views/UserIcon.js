/* @flow */

import React, { Component } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import AvatarRound from './AvatarRound';

export default class UserIcon extends Component<void, any, void> {
	shouldComponentUpdate(nextProps: any, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return <AvatarRound {...this.props} />;
	}
}
