/* @flow */

import { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const RoomTitleContainer = Connect(({ room }) => ({
	room: {
		key: {
			type: 'entity',
			id: room
		},
		transform: roomObj => roomObj && roomObj.name ? roomObj.name : room
	}
}))(Dummy);

RoomTitleContainer.propTypes = {
	room: PropTypes.string.isRequired
};

export default RoomTitleContainer;
