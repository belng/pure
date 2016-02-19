/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const RoomTitleContainer = Connect(({ room }) => ({
	room: {
		key: {
			type: 'entity',
			id: room
		},
		transform: roomObj => roomObj.guides && room.guides.displayName ? roomObj.guides.displayName : room
	}
}))(Dummy);

export default RoomTitleContainer;
