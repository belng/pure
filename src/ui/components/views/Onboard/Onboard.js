

import React from 'react-native';
import PersistentNavigator from '../../../navigation/PersistentNavigator';
import { convertRouteToState } from '../../../../lib/Route';

const {
	NavigationState
} = React;

export default class Onboard extends React.Component {
	render(): Element {
		const navigationState = convertRouteToState({
			name: 'onboard',
			props: {},
			fullscreen: true
		});

		return (
			<PersistentNavigator
				initialState={new NavigationState(navigationState.routes, navigationState.index)}
			/>
		);
	}
}
