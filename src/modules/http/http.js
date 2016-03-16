import koa from 'koa';
import http from 'http';
import logger from 'koa-logger';
import mount from 'koa-mount';
import serve from 'koa-static';
import opn from 'opn';
import client from '../client/middleware';
import { config, bus } from '../../core-server';

const app = koa();
const httpServer = http.createServer(app.callback()).listen(config.server.host.split(':')[1]);

app.use(logger());
app.use(client());

if (process.env.NODE_ENV !== 'production') {
	// Serve files under static/tests for any requests to /tests/
	app.use(mount('/tests', serve('static/tests'), { defer: true }));
}

// Open the URL in browser
if (config.open_in_browser) {
	opn(`${config.server.protocol}//${config.server.host}`);
}

app.httpServer = httpServer;
bus.emit('http/init', app);
