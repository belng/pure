/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const RoomsContainer = Connect(({ user }) => ({
	rooms: {
		key: {
			slice: {
				type: 'rel',
				link: {
					room: 'item',
				},
				filter: {
					user
				},
				order: 'statusTime'
			},
		}
	}
}))(Dummy);

export default RoomsContainer;
