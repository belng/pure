/* @flow */

import { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const ChatTitleContainer = Connect(({ thread }) => ({
	title: {
		key: {
			type: 'entity',
			id: thread
		},
		transform: o => o ? o.name : null
	}
}))(Dummy);

ChatTitleContainer.propTypes = {
	thread: PropTypes.string.isRequired
};

export default ChatTitleContainer;
