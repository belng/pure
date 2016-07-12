/* @flow */

import { bus, cache } from '../../core-client';
import store from './store';

cache.onChange(changes => {
	bus.emit('postchange', changes);
});

bus.on('store:dispatch', action => {
	if (action.type === 'ERROR' && action.payload && action.payload.state) {
		const { ...state } = action.payload.state; // eslint-disable-line no-use-before-define

		store.dispatch({
			type: 'SET_STATE',
			payload: state,
		});
	}
});

bus.emit('state:init', {}, (err, state) => {
	if (err) {
		return;
	}

	store.dispatch({
		type: 'SET_STATE',
		payload: state,
	});
});
