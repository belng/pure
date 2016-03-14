import uid from '../../lib/uid-server';
import { Constants } from '../../core-server';
export default function (data) {
	let stanza;
	let topic = data.parents && data.parents[0] || data.user;

	if (data.type === Constants.TYPE_THREAD) {
		topic = 'room-' + topic;
	}
	if (data.type === Constants.TYPE_TEXT) {
		topic = 'thread-' + topic;
	}
	if (data.type === Constants.TYPE_NOTE) {
		topic = 'mention-' + topic;
	}
	stanza = `<message>
	<gcm xmlns="google:mobile:data">
	{
		"to": "/topics/${topic}",
		"message_id": "${uid()}",
		"data": ${JSON.stringify(data)},
		"notification": ${JSON.stringify(data)}
	}
	</gcm>
	</message>`;
	console.log("stanza created: ", stanza);
	return (stanza);
}
