/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import ChatTitle from '../views/ChatTitle';

const ChatTitleContainer = (props: any) => {
	return (
		<Connect
			mapSubscriptionToProps={{
				thread: {
					key: {
						type: 'entity',
						id: props.thread
					}
				}
			}}
			passProps={props}
			component={ChatTitle}
		/>
	);
};

ChatTitleContainer.propTypes = {
	thread: PropTypes.string.isRequired
};

export default ChatTitleContainer;
