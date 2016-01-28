/* @flow */

export default class Counter {
	constructor () { this.pending = 0; }
	fire () {
		if (this.pending === 0 && !this.alreadyFired && this.fn) {
			this.fn.call(null);
			this.alreadyFired = true;
		}
	}
	inc () {
		this.pending++;
	}
	dec () {
		this.pending--;
		this.fire();
	}
	then (fn) {
		this.fn = fn;
		this.fire();
	}
	err (val) {
		this.fn.call(null, val);
		this.alreadyFired = true;
	}
}
