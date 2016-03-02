import uid from '../../lib/uid-server';

export default function (data) {

	return (
		`<message>
		<gcm xmlns="google:mobile:data">
		{
			"to": "/topics/${data.group}",
			"message_id": "${uid()}",
			"data": ${JSON.stringify(data)},
			"notification": {}
		}
		</gcm>
		</message>`
	);
}
