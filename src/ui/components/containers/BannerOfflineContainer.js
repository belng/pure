/* @flow */

import createContainer from '../../../modules/store/createContainer';
import BannerOffline from '../views/Banner/BannerOffline';

const mapSubscriptionToProps = {
	status: {
		type: 'connectionStatus',
	},
};

export default createContainer(mapSubscriptionToProps)(BannerOffline);
