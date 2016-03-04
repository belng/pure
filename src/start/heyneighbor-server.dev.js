#! ./node_modules/babel-cli/bin/babel-node.js

import 'babel-polyfill';
import './heyneighbor-server-base';
import winston from 'winston';

if (process.env.NODE_ENV !== 'production') {
	winston.level = 'debug';
}
