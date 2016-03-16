/* @flow */

import ReactNative from 'react-native';
import { bus } from '../../core-client';

const {
	Linking
} = ReactNative;

bus.on('state:init', async () => {
	const initialURL = await Linking.getInitialURL();

	bus.emit('change', {
		state: {
			initialURL
		}
	});
});
