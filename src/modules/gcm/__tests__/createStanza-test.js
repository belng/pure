/* eslint-env jest */
/* eslint import/no-commonjs: 0 */
/* eslint no-console:0 */
'use strict';
jest.autoMockOff();

const createStanza = require('../createStanza').default;

describe('test creating stanza', () => {
	it('create stanza for threads', () => {
		const data = {
			user: 'testinguser',
			event: 1,
			createTime: 1457003330852,
			updateTime: 1457003330852,
			type: 40,
			group: 'shagf7-sdfhg834-dskfg834',
			data: {
				textId: 'hags732-dsf-sdr32a',
				from: 'sbtestinguser',
				text: '@testinguser hi',
				thread: 'some thread title',
				createTime: 1457003330852,
				room: 'scrollback'
			}
		};

		const s = createStanza(data);

		console.log(s);
		expect(s).toEqual(
			`<message>
		<gcm xmlns="google:mobile:data">
		{
			"to": "/topics/note-testinguser",
			"message_id": "IpIc0eDWEKbUa0c0O64n",
			"data": {"user":"testinguser","event":1,"eventTime":1457003330852,"type":40,"group":"shagf7-sdfhg834-dskfg834","data":{"textId":"hags732-dsf-sdr32a","from":"sbtestinguser","text":"@testinguser hi","thread":"some thread title","createTime":1457003330852,"room":"scrollback"}},
			"notification": {}
		}
		</gcm>
		</message>`
		);
	});

});
