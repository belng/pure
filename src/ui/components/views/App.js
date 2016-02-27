/* @flow */

import React from 'react';
import Splash from './Splash';
import OnboardContainer from '../containers/OnboardContainer';
import Offline from './Offline';

type Props = {
	connection: 'connecting' | 'online' | 'offline'
}

export default class App extends React.Component<void, Props, void> {
	render() {
		const {
			connection,
		} = this.props;

		switch (connection) {
		case 'online':
			return <OnboardContainer {...this.props} />;
		case 'offline':
			return <Offline />;
		default:
			return <Splash />;
		}
	}
}

App.propTypes = {
	connection: React.PropTypes.oneOf([ 'connecting', 'online', 'offline' ])
};
