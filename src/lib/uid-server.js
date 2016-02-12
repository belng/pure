/* @flow */

import crypto from 'crypto';

export default function uid(n?: number = 20): string {
	return crypto
			.randomBytes(Math.ceil(3 * n / 4))
			.toString('base64')
			.substring(0, n);
}
