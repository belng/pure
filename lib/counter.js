/* @flow */

export default class Counter {
	fn: Function;
	alreadyFired: boolean;
	pending: number = 0;

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
	then (fn: Function) {
		this.fn = fn;
		this.fire();
	}
	err (val: Error) {
		this.fn.call(null, val);
		this.alreadyFired = true;
	}
}
