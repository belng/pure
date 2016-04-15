import React from 'react';
import ReactDOM from 'react-dom';
import TodoList from './TodoList';
import config from '../../../config/modui.json';

const eio = require('engine.io-client'); // eslint-disable-line import/no-commonjs

let todos = [];

const client = new eio.Socket({ host: 'wss://' + config.server.host, path: '/admin/socket' });

function rerender() {
	ReactDOM.render(<TodoList todos={todos}/>, document.getElementById('root'));
}

client.on('message', (message) => { // eslint-disable-line
	console.log('--->', message); // eslint-disable-line
	const data = JSON.parse(message);
	todos.unshift(data);
	todos = todos.slice(0, 1000);
	rerender();
});
