/* @flow */

import React, { PropTypes } from 'react';
import { config } from '../../../core-client';
import Connect from '../../../modules/store/Connect';
import ShareButton from '../views/ShareButton';
import { convertRouteToURL } from '../../../lib/Route';

const { host, protocol } = config.server;

const ShareButtonContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			url: {
				key: {
					type: 'entity',
					id: props.thread
				},
				transform: thread => thread && thread.type !== 'loading' ? protocol + '//' + host + convertRouteToURL({
					name: 'chat',
					props: {
						room: thread.parents[0],
						thread: thread.id
					}
				}) : null
			}
		}}
		passProps={props}
		component={ShareButton}
	/>
);

ShareButtonContainer.propTypes = {
	thread: PropTypes.string.isRequired,
};

export default ShareButtonContainer;
