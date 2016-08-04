/* @flow */

import createContainer from '../../../modules/store/createContainer';
import DiscussionDetails from '../views/Discussion/DiscussionDetails';

const mapSubscriptionToProps = ({ thread }) => ({
	thread: {
		type: 'entity',
		id: thread,
	},
});

export default createContainer(mapSubscriptionToProps)(DiscussionDetails);
