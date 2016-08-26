import test from 'ava';
import { getResponse } from '../image-upload';

test('generate policies for "content" type upload', t => {
	const req = {
		auth: {
			user: 'harish',
		},
		uploadType: 'content',
		contentId: 'df37y32-h87er-efewrywe-we',
		filename: 'myfile.jpg',
	};
	const response = getResponse(req);
	t.is(response.policy.acl, 'public-read');
});
