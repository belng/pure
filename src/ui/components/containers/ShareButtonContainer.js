/* @flow */

import createContainer from '../../../modules/store/createContainer';
import ShareButton from '../views/Appbar/ShareButton';

const getThreadRoute = thread => ({
	name: 'chat',
	props: {
		room: thread.parents[0],
		thread: thread.id,
		title: thread.name,
	},
});

const mapDispatchToProps = dispatch => ({
	shareLink: thread => {
		dispatch({
			type: 'SHARE_LINK',
			payload: {
				title: 'Share discussion',
				route: getThreadRoute(thread),
			},
		});
	},
});

const mapSubscriptionToProps = ({ thread }) => {
	return {
		thread: {
			type: 'entity',
			id: thread,
		},
	};
};

export default createContainer(mapSubscriptionToProps, mapDispatchToProps)(ShareButton);
