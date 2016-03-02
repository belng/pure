/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const mapSubscriptionToProps = {
	status: {
		key: {
			type: 'state',
			path: 'connectionStatus',
		}
	}
};

const BannerOfflineContainer = (props: any) => (
	<Connect mapSubscriptionToProps={mapSubscriptionToProps}>
		<Dummy {...props} />
	</Connect>
);

export default BannerOfflineContainer;
