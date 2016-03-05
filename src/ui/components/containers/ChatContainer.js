/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Chat from '../views/Chat';
import { sendText } from '../../../modules/store/actions';

const ChatContainer = (props: any) => (
	<Connect
		mapActionsToProps={{
			sendText: (store, result) => (body, meta) => store.dispatch(sendText({
				body,
				meta,
				parents: [ result.thread.id ].concat(result.thread.parents),
				creator: props.user
			})),
		}}
		mapSubscriptionToProps={{
			thread: {
				key: {
					type: 'entity',
					id: props.thread,
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
	user: PropTypes.string,
};

export default ChatContainer;
