import koa from 'koa';
import http from 'http';
import logger from 'koa-logger';
import mount from 'koa-mount';
import serve from 'koa-static';
import opn from 'opn';
import client from '../client/middleware';
import { config, bus } from '../../core-server';

const app = koa();
const httpServer = http.createServer(app.callback()).listen(config.server.port);

app.use(logger());
app.use(client());

// Serve files under static/ for any requests to /static/
app.use(mount('/static/', serve('static/'), { defer: true }));

// Open the URL in browser
if (config.open_in_browser) {
	opn(`${config.server.protocol}//${config.server.host}`);
}

app.httpServer = httpServer;
bus.emit('http/init', app);
