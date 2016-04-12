import React from 'react';
import ReactDOM from 'react-dom';
import TodoList from './TodoList';
import config from '../../../config/modui.json';

const eio = require('engine.io-client'); // eslint-disable-line import/no-commonjs

let todos = [];

const client = new eio.Socket((config.server.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + config.server.host);


function rerender() {
	ReactDOM.render(<TodoList todos={todos}/>, document.getElementById('root'));
}

client.on('message', function (message) { // eslint-disable-line
	console.log('--->', message); // eslint-disable-line
	const data = JSON.parse(message);
	todos = todos.splice(0, 1000);
	todos.unshift(data.todo);
	rerender();
});
