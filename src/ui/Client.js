import 'babel-polyfill';
import '../modules/client/client';
import React from 'react';
import ReactDOM from 'react-dom';
import Home from './components/views/Home.web';

document.addEventListener('readystatechange', () => {
	if (document.readyState === 'complete') {
		ReactDOM.render(<Home />, document.getElementById('root'));
	}
});
