/* @flow */

import { bus, cache } from '../../core-client';
import store from './store';

cache.onChange(changes => {
	bus.emit('postchange', changes);
});

bus.on('change', changes => {
	cache.put(changes);
	if (changes.state) {
		store.dispatch({
			type: 'SET_STATE',
			payload: changes.state
		});
	}
});

bus.on('error', changes => {
	if (changes.state) {
		store.dispatch({
			type: 'SET_STATE',
			payload: changes.state
		});
		if (changes.state.signin) {
			store.dispatch({
				type: 'SET_SESSION',
				payload: null
			});
		}
	}
});

setTimeout(() => {
	// FIXME: Move to `componentDidMount` of root component
	store.dispatch({ type: 'INITIALIZE_STATE' });
}, 0);
