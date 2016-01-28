/* @flow */

/* eslint-env browser */

"use strict";

module.exports = function (num) {
	var n, i, l, s, crypto = window.crypto || window.msCrypto;

	n = (typeof num !== "number" || isNaN(num)) ? 20 : num;

	if (crypto) {
		s = btoa(String.fromCharCode.apply(
			null, crypto.getRandomValues(new Uint8Array(Math.ceil(3 * n / 4)))
		));
	} else {
		s = "";
		for (i = 0, l = Math.ceil(3 * n / 4); i < l; i++) {
			s += String.fromCharCode((Math.random() * 256) | 0);
		}
		s = btoa(s);
	}

	return s.substring(0, n);
};
