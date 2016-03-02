/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

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
						start: null,
						before: 100,
						after: 0
					}
				},
				transform: notes => notes ? notes.length : 0
			}
		}}
		passProps={props}
		component={Dummy}
	/>
);

NotificationBadgeContainer.propTypes = {
	user: PropTypes.string.isRequired
};

export default NotificationBadgeContainer;
