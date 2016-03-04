/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import App from '../views/App';

const mapSubscriptionToProps = {
	user: {
		key: {
			type: 'state',
			path: 'user'
		},
	},
	connection: {
		key: {
			type: 'state',
			path: 'connectionStatus',
		}
	},
	session: {
		key: {
			type: 'state',
			path: 'session',
		}
	}
};

const AppContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		passProps={props}
		component={App}
	/>
);

export default AppContainer;
