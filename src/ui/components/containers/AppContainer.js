/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

export default Connect({
	user: 'me',
	connection: {
		key: {
			type: 'app',
			path: 'connectionStatus',
		}
	}
})(Dummy);
