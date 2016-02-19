/* @flow */

import { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const DiscussionDetailsContainer = Connect(({ thread }) => ({
	thread: {
		key: {
			type: 'entity',
			id: thread
		}
	}
}))(Dummy);

DiscussionDetailsContainer.propTypes = {
	thread: PropTypes.string.isRequired
};

export default DiscussionDetailsContainer;
