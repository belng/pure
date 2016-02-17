/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

export default Connect({
	user: {
		key: 'me',
		transform: user => user ? user.picture : null
	}
})(Dummy);
