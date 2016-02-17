/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const PeopleListContainer = Connect(({ room }) => ({
	count: {
		key: {
			slice: {
				type: 'rel',
				link: {
					user: 'user'
				},
				filter: {
					room
				},
				order: 'statusTime'
			},
			range: {
				start: null,
				before: 100,
				after: 0
			}
		}
	}
}))(Dummy);

export default PeopleListContainer;
