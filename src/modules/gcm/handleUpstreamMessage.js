import { connect } from './xmpp';
import log from 'winston';
import { config, bus } from '../../core-server';
let client;

function handleUpstreamMessage (upStanza, cb) {
	const stnza =
	`<message>
		<gcm xmlns="google:mobile:data">
			{
					"to":"${upStanza.from}",
					"message_id":"${upStanza.message_id}"
					"message_type":"ack"
			}
		</gcm>
	</message>`;

	log.info('Sending ACK message: ', stnza);
	client.send(stnza);
	cb(upStanza);
}

function updateUser(u) {
	bus.emit('change', {
		auth: {
			session: u.session
		}
	}, (err, changes) => {
		if (err) {
			log.e(err);
			return;
		}
		const userId = changes.response.state.user;

		bus.emit('change', {
			entities: {
				[userId]: {	params: { gcm: { [u.device]: u.token } } }
			}
		}, (e, c) => {
			log.info(e, c);
		});
	});
}

function handleStanza(stanza) {
	const st = stanza.toJSON();
	let x;

	log.info('stanza: ', st);

	if (st.children && st.children[0] && st.children[0].children) {
		x = JSON.parse(st.children[0].children[0]);
	}
	if (x && x.category === config.gcm.packageName) {
		log.info('Handle upstream message: ', x);
		handleUpstreamMessage(x, updateUser);
	}
}

if (config.gcm.senderId) {
	connect(c => {
		client = c;
		log.info('XMPP client connected');
		c.on('stanza', handleStanza);
	});
}
