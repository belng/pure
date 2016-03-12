/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import MyPlaces from '../views/Account/MyPlaces';
import { addPlace, removePlace } from '../../../modules/store/actions';

const mapSubscriptionToProps = {
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
	addPlace: (store, result, props) => (type, place) => store.dispatch(addPlace(props.user, type, place)),
	removePlace: (store, result, props) => (type, place) => store.dispatch(removePlace(props.user, type, place)),
};

const MyPlacesContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={MyPlaces}
	/>
);

export default PassUserProp(MyPlacesContainer);
