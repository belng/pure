/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import { dismissNote } from '../../../modules/store/actions';

const mapActionsToProps = {
	dismissNote: store => id => store.dispatch(dismissNote(id))
};

const NotificationCenterContainer = (props: any) => (
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
				}
			}
		}}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={Dummy}
	/>
);

NotificationCenterContainer.propTypes = {
	user: PropTypes.string.isRequired
};

export default NotificationCenterContainer;
