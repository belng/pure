/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const HomeContainer = Connect({
	initialURL: {
		key: 'app',
		path: 'initialURL',
	}
})(Dummy);

export default HomeContainer;
