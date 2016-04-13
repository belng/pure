import { bus } from '../../core-server';
import engine from 'engine.io';
import http from 'http';
import Constants from '../../lib/Constants';
import fs from 'fs';
import path from 'path';

const httpServer = http.createServer((req, res) => {
	console.log(req);	// eslint-disable-line
	switch (req.url) {
	case '/':
		fs.createReadStream(path.join(__dirname, '../../../static/dist/modui.html')).pipe(res);
		break;
	}
});

httpServer.listen(3030);

const sockServer = engine.attach(httpServer);
const sockets = [];

sockServer.on('connection', (socket) => {
	sockets.push(socket);
	socket.on('close', () => {
		const index = sockets.indexOf(socket);
		if (index >= 0) { sockets.splice(index, 1); }
	});
});

bus.on('change', (change) => {
	if (change.entities) {
		for (const id in change.entities) {
			const entity = change.entities[id];
			if (
				entity !== Constants.TYPE_THREAD &&
				entity !== Constants.TYPE_TEXT
			) { return; }
			for (const socket of sockets) {
				socket.send(JSON.stringify(entity));
			}
		}
	}
});
