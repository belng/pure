/* @flow */

import { PropTypes } from 'react';
import { config } from '../../../core-client';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
import { convertRouteToURL } from '../../../lib/Route';

const { host, protocol } = config.server;

const ShareButtonContainer = Connect(({ thread }) => ({
	url: {
		key: {
			type: 'entity',
			id: thread
		},
		transform: threadObj => threadObj ? protocol + '//' + host + '/' + convertRouteToURL({
			name: 'chat',
			props: {
				room: threadObj.parents[0],
				thread: threadObj.id
			}
		}) : null
	}
}))(Dummy);

ShareButtonContainer.propTypes = {
	thread: PropTypes.string.isRequired,
};

export default ShareButtonContainer;
