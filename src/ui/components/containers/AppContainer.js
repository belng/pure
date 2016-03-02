/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import App from '../views/App';

const mapSubscriptionToProps = {
	user: {
		key: 'me',
		transform: user => user ? user.id : null,
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
	<Connect mapSubscriptionToProps={mapSubscriptionToProps}>
		<App {...props} />
	</Connect>
);

export default AppContainer;
