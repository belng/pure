/* @flow */

import Connect from '../../../modules/store/Connect';
import Home from '../views/Home';

const HomeContainer = Connect({
	initialURL: {
		key: {
			type: 'app',
			path: 'initialURL',
		}
	}
})(Home);

export default HomeContainer;
