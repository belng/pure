/* @flow */

import { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const NotificationCenterContainer = Connect(({ user }) => ({
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
		}
	}
}))(Dummy);

NotificationCenterContainer.propTypes = {
	user: PropTypes.string.isRequired
};

export default NotificationCenterContainer;
