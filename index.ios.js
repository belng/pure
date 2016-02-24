import './src/ui/navigation-rfc/polyfill';
import React from 'react-native';
import AppContainer from './src/ui/components/containers/AppContainer';

const {
	AppRegistry
} = React;

export default class HeyNeighbor extends React.Component {
	render() {
		return <AppContainer />;
	}
}

AppRegistry.registerComponent('HeyNeighbor', () => HeyNeighbor);
