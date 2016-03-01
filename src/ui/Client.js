/* @flow */

import './navigation-rfc/polyfill';
import '../modules/client/client';
import React from 'react-native';
import AppContainer from './components/containers/AppContainer';
import Provider from '../modules/store/Provider';
import * as store from '../modules/store/store';

const {
	AppRegistry
} = React;

export default class HeyNeighbor extends React.Component {
	render() {
		return (
			<Provider store={store}>
				<AppContainer />
			</Provider>
		);
	}
}

AppRegistry.registerComponent('HeyNeighbor', () => HeyNeighbor);
