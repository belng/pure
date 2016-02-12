/* @flow */

import Connect from '../../../modules/store/Connect';

export default Connect({
	user: {
		slice: 'me',
		transform: user => user ? user.picture : null
	}
})(/* Component */);
