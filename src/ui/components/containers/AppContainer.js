/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import App from '../views/App';

const mapSubscriptionToProps = {
	connection: {
		type: 'connectionStatus',
	},
	session: {
		type: 'session',
	},
};

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps),
)(App);
