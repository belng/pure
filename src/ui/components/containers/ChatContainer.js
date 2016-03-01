/* @flow */

import { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import { sendText } from '../../../modules/store/actions';

const ChatContainer = Connect(({ thread }) => ({
	thread: {
		type: 'entity',
		id: thread,
	}
}), {
	sendText: (props, store) => (body, meta) => store.dispatch(sendText({
		body,
		meta,
		parents: [ props.thread.id ].concat(props.thread.parents),
		creator: props.user
	}))
})(Dummy);

ChatContainer.propTypes = {
	room: PropTypes.string.isRequired,
	thread: PropTypes.string.isRequired,
	user: PropTypes.string.isRequired,
};

export default ChatContainer;
