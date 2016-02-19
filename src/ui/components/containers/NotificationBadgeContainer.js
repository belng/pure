/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const NotificationBadgeContainer = Connect(({ user }) => ({
	count: {
		key: {
			slice: {
				type: 'note',
				filter: {
					user
				},
				order: 'eventTime'
			},
			range: {
				start: null,
				before: 100,
				after: 0
			}
		},
		transform: notes => notes ? notes.length : 0
	}
}))(Dummy);

export default NotificationBadgeContainer;
