/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const RoomTitleContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			room: {
				key: {
					type: 'entity',
					id: props.room
				},
				transform: room => room && room.name ? room.name : props.room
			}
		}}
		passProps={props}
		component={Dummy}
	/>
);

RoomTitleContainer.propTypes = {
	room: PropTypes.string.isRequired
};

export default RoomTitleContainer;
