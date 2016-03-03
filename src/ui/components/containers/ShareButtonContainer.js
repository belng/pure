/* @flow */

import React, { PropTypes } from 'react';
import { config } from '../../../core-client';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';
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
				transform: threadObj => threadObj ? protocol + '//' + host + '/' + convertRouteToURL({
					name: 'chat',
					props: {
						room: threadObj.parents[0],
						thread: threadObj.id
					}
				}) : null
			}
		}}
		passProps={props}
		component={Dummy}
	/>
);

ShareButtonContainer.propTypes = {
	thread: PropTypes.string.isRequired,
};

export default ShareButtonContainer;
