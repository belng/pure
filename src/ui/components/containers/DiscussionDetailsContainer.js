/* @flow */

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

export default DiscussionDetailsContainer;
