/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const BannerOfflineContainer = Connect({
	status: {
		key: 'app',
		transform: app => app ? app.connectionStatus : null,
	}
})(Dummy);

export default BannerOfflineContainer;
