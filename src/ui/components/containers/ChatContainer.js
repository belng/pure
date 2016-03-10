/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Chat from '../views/Chat';
import { sendMessage } from '../../../modules/store/actions';

const ChatContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			user: {
				key: {
					type: 'state',
					path: 'user'
				}
			},
			parents: {
				key: {
					type: 'entity',
					id: props.thread
				},
				transform: thread => thread && thread.parents ? thread.parents : []
			}
		}}
		mapActionsToProps={{
			sendMessage: (store, result) => (body, meta) => store.dispatch(sendMessage({
				body,
				meta,
				parents: [ props.thread ].concat(result.parents),
				creator: result.user
			})),
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
