/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const RoomsContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			rooms: {
				key: {
					slice: {
						type: 'rel',
						link: {
							room: 'item',
						},
						filter: {
							user: props.user
						},
						order: 'statusTime'
					},
					range: {
						start: -Infinity,
						before: 100,
						after: 0,
					}
				}
			}
		}}
	>
		<Dummy />
	</Connect>
);

RoomsContainer.propTypes = {
	user: PropTypes.string.isRequired
};

export default RoomsContainer;
