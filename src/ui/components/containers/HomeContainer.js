/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import Home from '../views/Home';

const HomeContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			initialURL: {
				key: {
					type: 'state',
					path: 'initialURL',
				}
			}
		}}
	>
		<Home {...props} />
	</Connect>
);

export default HomeContainer;
