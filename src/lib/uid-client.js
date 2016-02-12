/* @flow */

'use strict';

export default function(n?: number = 20): string {
	const crypto = window.crypto || window.msCrypto;

	let i, l, s;

	if (crypto) {
		s = btoa(String.fromCharCode.apply(
			null, crypto.getRandomValues(new Uint8Array(Math.ceil(3 * n / 4)))
		));
	} else {
		s = '';
		for (i = 0, l = Math.ceil(3 * n / 4); i < l; i++) {
			s += String.fromCharCode((Math.random() * 256) | 0);
		}
		s = btoa(s);
	}

	return s.substring(0, n);
}
