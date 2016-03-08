/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import MyPlaces from '../views/Account/MyPlaces';
import { addPlace, removePlace } from '../../../modules/store/actions';

const mapSubscriptionToProps = {
	user: {
		key: {
			type: 'state',
			path: 'user'
		},
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
	addPlace: (store, result) => (type, place) => store.dispatch(addPlace(result.user, type, place)),
	removePlace: (store, result) => (type, place) => store.dispatch(removePlace(result.user, type, place)),
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
