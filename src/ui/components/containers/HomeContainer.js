/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const HomeContainer = Connect({
	initialURL: {
		key: 'app',
		transform: app => app ? app.initialURL : null,
	}
})(Dummy);

export default HomeContainer;
