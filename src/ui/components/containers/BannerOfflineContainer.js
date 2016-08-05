/* @flow */

import createContainer from '../../../modules/store/createContainer';
import BannerOffline from '../views/Banner/BannerOffline';

const mapSubscriptionToProps = {
	status: {
		type: 'state',
		path: 'connectionStatus',
	},
};

export default createContainer(mapSubscriptionToProps)(BannerOffline);
