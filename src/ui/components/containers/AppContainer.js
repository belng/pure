/* @flow */

import Connect from '../../../modules/store/Connect';
import App from '../views/App';

export default Connect({
	user: {
		key: 'me',
		transform: user => user ? user.id : null,
	},
	connection: {
		key: {
			type: 'app',
			path: 'connectionStatus',
		}
	}
})(App);
