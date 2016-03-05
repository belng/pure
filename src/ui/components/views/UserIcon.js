/* @flow */

import React, { Component } from 'react';
import AvatarRound from './AvatarRound';

export default class UserIcon extends Component {
	render() {
		return <AvatarRound {...this.props} />;
	}
}
