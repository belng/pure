/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import NotificationCenter from '../views/NotificationCenter';
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
		component={NotificationCenter}
	/>
);

NotificationCenterContainer.propTypes = {
	user: PropTypes.string
};

export default NotificationCenterContainer;
