import engine from 'engine.io';
import stringPack from 'stringpack';
import core from '../../core';
import uid from '../../lib/uid-server';
import notify from './dispatch';
import models from '../../models/models';

const sockets = {}, bus = core.bus;

let packerArg, packer;

packerArg = Object.keys(models).sort().map(key => models[key]);
packer = stringPack(packerArg);


function sendError(socket, code, reason, event) {
	socket.send(JSON.stringify({
		type: 'error',
		code,
		reason,
		event
	}));
}

bus.on('http/init', app => {
	const socketServer = engine.attach(app.httpServer);

	socketServer.on('connection', socket => {
		const resourceId = uid(16);

		sockets[resourceId] = socket;
		socket.on('close', () => {
			bus.emit('presence/offline', {
				resourceId
			});
			delete sockets[resourceId];
		});

		socket.on('message', m => {
			let message;

			try {
				message = packer.decode(m);
			} catch (e) {
				return sendError(socket, 'ERR_EVT_PARSE', e.message);
			}

			message.id = uid(16);
			(message.auth = message.auth || {}).resource = resourceId;

			function handleSetState(err) {
				if (err) {
					return sendError(
						socket, err.code || 'ERR_UNKNOWN', err.message, message
					);
				}

				if (message.response) {
					if (message.auth && message.auth.user) {
						bus.emit('presence/online', {
							resource: resourceId,
							user: message.auth.user
						});
					}
					socket.send(packer.encode(message.response));
				}
			}

			bus.emit('setstate', message, handleSetState);
		});
	});
});

bus.on('statechange', changes => {
	notify(changes, core, {}).on('data', (change, rel) => {
		Object.keys(rel.resources).forEach(e => {
			if (!sockets[e]) return;
			sockets[e].send(packer.encode(change));
		});
	});
});
