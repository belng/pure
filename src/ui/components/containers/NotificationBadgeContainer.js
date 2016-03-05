/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const NotificationBadgeContainer = (props: any) => (
	<Connect
		passProps={props}
		component={Dummy}
	/>
);

NotificationBadgeContainer.propTypes = {
	user: PropTypes.string.isRequired
};

const mapSubscriptionToProps = {
	user: {
		key: {
			type: 'state',
			path: 'user'
		},
	},
};

const NotificationBadgeContainerOuter = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		passProps={props}
		component={NotificationBadgeContainer}
	/>
);

export default NotificationBadgeContainerOuter;
