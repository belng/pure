/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const ChatTitleContainer = Connect(({ id }) => ({
	title: {
		key: {
			type: 'entity',
			id
		},
		transform: thread => thread ? thread.title : null
	}
}))(Dummy);

export default ChatTitleContainer;
