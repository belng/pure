/* @flow */

import React, { PropTypes } from 'react';
import Splash from './Splash';
import OnboardContainer from '../containers/OnboardContainer';
import Offline from './Offline';

type Props = {
	connection: 'connecting' | 'online' | 'offline';
	session: string,
	user: string
}

export default class App extends React.Component<void, Props, void> {
	render() {
		const {
			connection,
			session,
			user
		} = this.props;

		switch (connection) {
		case 'online':
			const loading = session === '@@loading' || session && !user;

			if (loading) {
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
	connection: PropTypes.oneOf([ 'connecting', 'online', 'offline' ]),
	session: PropTypes.string,
	user: PropTypes.string
};
