import uid from '../../lib/uid-server';
import { Constants } from '../../core-server';
export default function (pushData) {
	let topic;

	if (pushData.type === Constants.TYPE_THREAD) {
		topic = 'room-' + pushData.data.room;
	}
	if (pushData.type === Constants.TYPE_TEXT) {
		topic = 'thread-' + pushData.data.thread;
	}
	if (pushData.type === Constants.TYPE_NOTE) {
		topic = 'user-' + pushData.user;
	}
	const stanza = `<message>
	<gcm xmlns="google:mobile:data">
	{
		"to": "/topics/${topic}",
		"message_id": "${uid()}",
		"data": ${JSON.stringify(pushData)}
	}
	</gcm>
	</message>`;
	console.log("stanza created: ", stanza);
	return (stanza);
}
