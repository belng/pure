/* @flow */

import { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import { dismissNote } from '../../../modules/store/actions';

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
}), {
	dismissNote: (props, store) => id => store.setState(dismissNote(id))
})(Dummy);

NotificationCenterContainer.propTypes = {
	user: PropTypes.string.isRequired
};

export default NotificationCenterContainer;
