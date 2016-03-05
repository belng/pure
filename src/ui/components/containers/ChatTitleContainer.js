/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import ChatTitle from '../views/ChatTitle';

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
		passProps={props}
		component={ChatTitle}
	/>
);

ChatTitleContainer.propTypes = {
	thread: PropTypes.string.isRequired
};

export default ChatTitleContainer;
