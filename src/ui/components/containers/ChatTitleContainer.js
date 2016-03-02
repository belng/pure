/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const ChatTitleContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			title: {
				key: {
					type: 'entity',
					id: props.thread
				},
				transform: o => o ? o.name : null
			}
		}}
	>
		<Dummy {...props} />
	</Connect>
);

ChatTitleContainer.propTypes = {
	thread: PropTypes.string.isRequired
};

export default ChatTitleContainer;
