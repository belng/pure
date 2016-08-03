/* @flow */

import createContainer from '../../../modules/store/createContainer';
import RoomItem from '../views/Homescreen/RoomItem';

const mapSubscriptionToProps = props => ({
	room: {
		type: 'entity',
		id: props.room,
	},
});

export default createContainer(mapSubscriptionToProps)(RoomItem);
