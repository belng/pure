/* @flow */

import { bus, config } from '../../core-client';
import store from '../store/store';

const {
	server: {
		host,
		protocol,
	},
} = config;


bus.on('state:init', () => {
	const types = [ 'home', 'room' ];

	types.forEach(async type => {
		try {
			const res = await fetch(`${protocol}//${host}/s/cta_${type}.json`);
			const data = await res.json();

			store.dispatch({
				type: 'SET_STATE',
				payload: {
					['cta' + type]: data,
				}
			});
		} catch (e) {
			// ignore
		}
	});
});
