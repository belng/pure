/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const DiscussionDetailsContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			thread: {
				key: {
					type: 'entity',
					id: props.thread
				}
			}
		}}
		passProps={props}
		component={Dummy}
	/>
);

DiscussionDetailsContainer.propTypes = {
	thread: PropTypes.string.isRequired
};

export default DiscussionDetailsContainer;
