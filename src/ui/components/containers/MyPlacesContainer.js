/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import MyPlaces from '../views/Account/MyPlaces';
import { saveUser } from '../../../modules/store/actions';

const mapSubscriptionToProps = {
	user: {
		key: 'me',
	},
	places: {
		key: 'me',
		transform: user => user.params && user.params.places ? user.params.places : {},
	},
	location: {
		key: {
			type: 'state',
			path: 'location'
		},
	},
};

const mapActionsToProps = {
	savePlaces: (store, result) => places => store.dispatch(saveUser({
		...result.user,
		params: {
			...result.user.params,
			places
		}
	})),
};

const MyPlacesContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={MyPlaces}
	/>
);

export default MyPlacesContainer;
