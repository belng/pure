/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import NotificationBadge from '../views/NotificationBadge';

const NotificationBadgeContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			count: {
				key: {
					slice: {
						type: 'note',
						filter: {
							user: props.user
						},
						order: 'eventTime'
					},
					range: {
						start: Infinity,
						before: 100,
						after: 0
					}
				},
				transform: data => {
					if (data && data.length) {
						if (data.length === 1 && data[0] && data[0].type === 'loading') {
							return 0;
						} else {
							return data.length;
						}
					} else {
						return 0;
					}
				}
			}
		}}
		passProps={props}
		component={NotificationBadge}
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
