import engine from 'engine.io';
import winston from 'winston';
import * as core from '../../core-server';
import uid from '../../lib/uid-server';
import notify from './../../lib/dispatch';
import packer from './../../lib/packer';
import * as Constants from './../../lib/Constants';
// import util from 'util';
const sockets = {}, bus = core.bus;

function sendError(socket, code, reason, event) {
	socket.send(packer.encode({
		type: 'error',
		message: {
			code,
			reason,
			event
		}
	}));
}

function handleContacts(socket, message, resourceId, err) {
	const type = (message.response && message.response.error) ? 'error' : 'contacts';

	const toSend = {
			type,
			message: message.response
		}, encoded = packer.encode(toSend);
	socket.send(encoded);
}

function handleGetPolicy(socket, message, resourceId, err) {
	if (message.response && err) {
		const errorToSend = {
				type: 'error',
				message: message.response
			}, encoded = packer.encode(errorToSend);

		socket.send(encoded);
	} else {
		const toSend = {
				type: 's3/getPolicy',
				message: message.response
			}, encoded = packer.encode(toSend);
		socket.send(encoded);
	}
}
function handleChange(socket, message, resourceId, err) {
	if (err) {
		if (message.response) {
			const errorToSend = {
					type: 'error',
					message: message.response
				}, encoded = packer.encode(errorToSend);

			winston.debug('Sending Error:', errorToSend);
			socket.send(encoded);
		} else {
			sendError(
				socket, err.code || 'ERR_UNKNOWN', err.message, message
			);
		}
		return;
	}

	if (message.response) {
		if (message.auth && message.auth.user) {
			bus.emit('presence/online', {
				resource: resourceId,
				user: message.auth.user
			});
		}
		const toSend = {
				type: 'change',
				message: message.response
			}, encoded = packer.encode(toSend);

		winston.debug('To send:', JSON.stringify(toSend));
		winston.debug('Encoded string: ', encoded);
		socket.send(encoded);
	}
}

bus.on('http/init', app => {
	const socketServer = engine.attach(app.httpServer);

	socketServer.on('connection', socket => {
		const resourceId = uid(16);

		sockets[resourceId] = socket;
		socket.on('close', () => {
			bus.emit('presence/offline', {
				resource: resourceId
			});
			delete sockets[resourceId];
		});

		socket.on('message', m => {
			let frame, message;

			winston.info('new event: ', m);
			try {
				frame = packer.decode(m);
			} catch (e) {
				sendError(socket, 0, 'ERR_EVT_PARSE', e.message);
				return;
			}

			if (typeof message !== 'object') {
				sendError(socket, 'ERR_UNKNOWN', 'invalid');
				return;
			}
			message = frame.message;
			winston.debug(`Message Received: ${resourceId}: `, JSON.stringify(message));
			message.id = uid(16);

			(message.auth = message.auth || {}).resource = resourceId;

			if (frame.type === 'change' && message.entities) {
				for (const id in message.entities) {
					if (typeof message.entities[id].presence === 'number') {
						message.entities[id].resources = message.entities[id].resources || {};
						message.entities[id].resources[resourceId] = message.entities[id].presence;

						if (message.entities[id].type !== Constants.TYPE_USER) message.entities[id].presenceTime = Date.now();
					}
				}
			}


			message.source = 'socket';

			switch (frame.type) {
			case 'change':
				bus.emit('change', message, handleChange.bind(null, socket, message, resourceId));
				break;
			case 's3/getPolicy':
				bus.emit('s3/getPolicy', message, handleGetPolicy.bind(null, socket, message, resourceId));
				break;
			case 'contacts':
				bus.emit('s3/getPolicy', message, handleContacts.bind(null, socket, message, resourceId));
				break;
			}

		});
	});
});

bus.on('postchange', changes => {
	notify(changes, core.config).on('data', (change, rel) => {
		if (!rel || !rel.resources || typeof rel.resources !== 'object') return;
		Object.keys(rel.resources).forEach(e => {
			if (!sockets[e]) return;

			if (rel.resources[e] > Constants.PRESENCE_NONE) {
				const toDispatch = {
						type: 'change',
						message: change,
						info: 'sent by dispatch'
					}, encoded = packer.encode(toDispatch);

				winston.debug('Dispatching:' + e, JSON.stringify(toDispatch));
				winston.debug('Encoded string: ', encoded);
				sockets[e].send(encoded);
			}
		});
	});
});
