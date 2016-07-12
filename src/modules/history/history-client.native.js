/* @flow */

import ReactNative from 'react-native';
import { bus } from '../../core-client';
import store from '../../modules/store/store';

const {
	Linking,
} = ReactNative;

bus.on('state:init', () => {
	setTimeout(() => {
		// FIXME:
		// currentActivity is undefined on native side
		// If we put a delay, it somehow gets fixed
		Linking.getInitialURL()
		.catch(() => null)
		.then(initialURL => {
			store.dispatch({
				type: 'SET_STATE',
				payload: {
					initialURL,
				},
			});
		});
	}, 300);
});
