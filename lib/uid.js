module.exports = function uid(n) {
	n = (typeof n === 'undefined') ? 32 : n;
	return require("crypto").randomBytes(Math.ceil(n/2)).toString("hex").substring(0, n);
}
