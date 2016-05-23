/* @flow */

import { config } from '../../core-client';
import { open } from '../../lib/Popup';

type AuthCode = {
	code: string;
}

const url = config.server.protocol + '//' + config.server.host + config.facebook.login_url;

export default class Facebook {
	static async logInWithReadPermissions(): Promise<AuthCode> {
		let code;

		await open(url).forEach(({ data }) => {
			if (data && data.type === 'auth' && data.provider === 'facebook') {
				code = data.code;
			}
		});

		if (code) {
			return { code };
		} else {
			throw new Error('Failed to get auth token');
		}
	}

	static logInWithPublishPermissions() {
		return Promise.reject(new Error('Not implemented'));
	}

	static logOut() {
		return Promise.resolve(true);
	}

	static getCurrentAccessToken() {
		return Promise.reject(new Error('Not implemented'));
	}

	static sendGraphRequest() {
		return Promise.reject(new Error('Not implemented'));
	}
}
