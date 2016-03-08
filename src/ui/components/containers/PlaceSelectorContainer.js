/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import PlacesSelector from '../views/Account/PlacesSelector';

const PlaceSelectorContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			location: {
				key: {
					type: 'state',
					path: 'location'
				},
			},
		}}
		passProps={props}
		component={PlacesSelector}
	/>
);

export default PlaceSelectorContainer;
