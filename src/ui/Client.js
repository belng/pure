/* @flow */

import './navigation-rfc/polyfill';
import '../modules/client/client';
import React, { Component } from 'react';
import ReactNative from 'react-native';
import AppContainer from './components/containers/AppContainer';
import Provider from '../modules/store/Provider';
import * as store from '../modules/store/store';

const {
	AppRegistry
} = ReactNative;

export default class HeyNeighbor extends Component {
	render() {
		return (
			<Provider store={store}>
				<AppContainer />
			</Provider>
		);
	}
}

AppRegistry.registerComponent('HeyNeighbor', () => HeyNeighbor);
