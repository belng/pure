/* @flow */

import PropTypes from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import { sendText } from '../../../modules/store/actions';

const ChatContainer = Connect(({ thread }) => ({
	user: {
		key: 'me',
		transform: user => user && user.id
	},
	thread: {
		key: {
			type: 'entity',
			id: thread
		}
	}
}), {
	sendText: (props, store) => body => store.put(sendText({
		body,
		parents: [ props.thread.id ].push(...props.thread.parents),
		creator: props.user
	}))
})(Dummy);

ChatContainer.propTypes = {
	room: PropTypes.string.isRequired,
	thread: PropTypes.string.isRequired,
	user: PropTypes.string.isRequired,
};

export default ChatContainer;
