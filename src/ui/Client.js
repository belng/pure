import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Home from './components/views/Home.web';
import '../modules/socket/socket-client';

if (process.env.NODE_ENV !== 'production') {
	require('../modules/client-test/client-test');
}
document.addEventListener('readystatechange', () => {
	if (document.readyState === 'complete') {
		ReactDOM.render(<Home />, document.getElementById('root'));
	}
});
