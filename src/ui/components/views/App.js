/* @flow */

import React, { PropTypes } from 'react';
import Splash from './Splash';
import OnboardContainer from '../containers/OnboardContainer';
import Offline from './Offline';

type Props = {
	connection: '@@loading' | 'online' | 'offline';
	session: string
}

export default class App extends React.Component<void, Props, void> {
	render() {
		const {
			connection,
			session,
		} = this.props;

		switch (connection) {
		case 'online':
			if (session === '@@loading') {
				return <Splash />;
			} else {
				return <OnboardContainer {...this.props} />;
			}
		case 'offline':
			return <Offline />;
		default:
			return <Splash />;
		}
	}
}

App.propTypes = {
	connection: PropTypes.oneOf([ '@@loading', 'online', 'offline' ]),
	session: PropTypes.string
};
