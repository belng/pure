/* @flow */

import PropTypes from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const ChatContainer = Connect({
	user: {
		key: 'me',
		transform: user => user && user.id
	}
}, {
	sendText: (props, store) => text => store.sendText({
		text,
		room: props.room,
		thread: props.thread,
		from: props.user
	})
})(Dummy);

ChatContainer.propTypes = {
	room: PropTypes.string.isRequired,
	thread: PropTypes.string.isRequired,
	user: PropTypes.string.isRequired,
};

export default ChatContainer;
