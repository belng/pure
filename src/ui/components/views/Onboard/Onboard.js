/* @flow */

import React, { PropTypes, Component } from 'react';
import SignIn from './SignIn';

export default class Onboard extends Component<void, Object, void> {
	static propTypes = {
		page: PropTypes.string,
	};

	render() {
		const { props } = this;

		switch (props.page) {
		case 'PAGE_SIGN_IN':
			return <SignIn {...props} />;
		default:
			return null;
		}
	}
}
