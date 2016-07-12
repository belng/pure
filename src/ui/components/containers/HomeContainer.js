/* @flow */

import createContainer from '../../../modules/store/createContainer';
import Home from '../views/Home';

const mapSubscriptionToProps = {
	initialURL: {
		type: 'initialURL',
	},
};

export default createContainer(mapSubscriptionToProps)(Home);
