/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Chat from '../views/Chat';
import { sendMessage } from '../../../modules/store/actions';

const ChatContainer = (props: any) => (
	<Connect
		mapActionsToProps={{
			sendMessage: (store, result) => (body, meta) => store.dispatch(sendMessage({
				body,
				meta,
				parents: [ result.thread.id ].concat(result.thread.parents),
				creator: result.user
			})),
		}}
		mapSubscriptionToProps={{
			user: {
				key: {
					type: 'state',
					path: 'user'
				}
			}
		}}
		passProps={props}
		component={Chat}
	/>
);

ChatContainer.propTypes = {
	room: PropTypes.string.isRequired,
	thread: PropTypes.string.isRequired,
};

export default ChatContainer;
