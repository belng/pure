/* @flow */

import React, { Component } from 'react';
import AvatarRound from './AvatarRound';

export default class UserIcon extends Component<void, any, void> {
	render() {
		return <AvatarRound {...this.props} />;
	}
}
