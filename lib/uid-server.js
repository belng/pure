/* @flow */

module.exports = function uid(n) {
	n = (typeof n === 'undefined') ? 20 : n;
	return require("crypto").randomBytes(Math.ceil(3 * n / 4))
		.toString("base64").substring(0, n);
}
