/* @flow */

import { PropTypes } from 'react';
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
			range: {
				start: -Infinity,
				before: 100,
				after: 0,
			}
		}
	}
}))(Dummy);

RoomsContainer.propTypes = {
	user: PropTypes.string.isRequired
};

export default RoomsContainer;
