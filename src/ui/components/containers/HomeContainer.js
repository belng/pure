/* @flow */

import Connect from '../../../modules/store/Connect';
import Home from '../views/Home';

const HomeContainer = Connect({
	initialURL: {
		key: {
			type: 'state',
			path: 'initialURL',
		}
	}
})(Home);

export default HomeContainer;
