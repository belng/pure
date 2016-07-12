/* @flow */

import createContainer from '../../../modules/store/createContainer';
import PlaceSearch from '../views/Account/PlaceSearch';

const mapSubscriptionToProps = {
	location: {
		type: 'location',
	},
};

export default createContainer(mapSubscriptionToProps)(PlaceSearch);
