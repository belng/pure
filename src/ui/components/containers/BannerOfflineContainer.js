/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const BannerOfflineContainer = Connect({
	status: {
		key: {
			type: 'app',
			path: 'connectionStatus',
		}
	}
})(Dummy);

export default BannerOfflineContainer;
