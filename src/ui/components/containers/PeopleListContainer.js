/* @flow */

import { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const PeopleListContainer = Connect(({ thread }) => ({
	count: {
		key: {
			slice: {
				type: 'rel',
				link: {
					user: 'user'
				},
				filter: {
					thread
				},
				order: 'statusTime'
			},
			range: {
				start: -Infinity,
				before: 100,
				after: 0
			}
		}
	}
}))(Dummy);

PeopleListContainer.propTypes = {
	thread: PropTypes.string.isRequired
};

export default PeopleListContainer;
