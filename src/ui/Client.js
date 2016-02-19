import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Home from './components/views/Home.web';
import Provider from '../modules/store/Provider';
import * as store from '../modules/store/store';
import '../modules/socket/socket-client';

if (process.env.NODE_ENV !== 'production') {
	require('../modules/client-test/client-test');
}

document.addEventListener('readystatechange', () => {
	if (document.readyState === 'complete') {
		ReactDOM.render(
			<Provider store={store}>
				<Home />
			</Provider>,
			document.getElementById('root')
		);
	}
});
