/* @flow */

import { config } from '../../core-client';
import { open } from '../../lib/Popup';

type AuthCode = {
    code: string;
}

const url = config.server.protocol + '//' + config.server.host + config.google.login_url;

export default class GoogleSignIn {
	static async signIn(): Promise<AuthCode> {
		let code;

		await open(url).forEach(({ data }) => {
			if (data && data.type === 'auth' && data.provider === 'google') {
				code = data.code;
			}
		});

		if (code) {
			return { code };
		} else {
			throw new Error('Failed to get auth token');
		}
	}

	static signOut() {
		return Promise.resolve(true);
	}

	static revokeAccess() {
		return Promise.resolve(true);
	}
}
