/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

export default Connect({
	user: 'me',
	connection: {
		key: 'app',
		path: 'connectionStatus',
	}
})(Dummy);
