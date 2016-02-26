import React from 'react-native';
import Splash from './Splash';
import OnboardContainer from '../containers/OnboardContainer';
import Offline from './Offline';

export default class App extends React.Component {
	shouldComponentUpdate(nextProps) {
		return (
			this.props.user !== nextProps.user ||
			this.props.connectionStatus !== nextProps.connectionStatus
		);
	}

	render() {
		const {
			user,
			connectionStatus,
		} = this.props;

		if (connectionStatus === 'offline') {
			return <Offline />;
		}

		if (user === 'missing') {
			return <Splash />;
		}

		return <OnboardContainer user={user} />;
	}
}

App.propTypes = {
	user: React.PropTypes.string,
	connectionStatus: React.PropTypes.oneOf([ 'connecting', 'online', 'offline' ]).isRequired
};
