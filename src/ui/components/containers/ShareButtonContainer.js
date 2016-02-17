/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import { convertRouteToURL } from '../../../lib/Route';

const ShareButtonContainer = Connect(({ thread }) => ({
	url: {
		key: {
			type: 'entity',
			id: thread
		},
		// TODO: add protocol and host
		transform: threadObj => threadObj ? convertRouteToURL({
			name: 'chat',
			props: {
				room: threadObj.parents[0],
				thread: threadObj.id
			}
		}) : null
	}
}))(Dummy);

export default ShareButtonContainer;
