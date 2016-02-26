/* @flow */

export default class EnhancedError extends Error {
	code: string;

	constructor(message: string, code: string) {
		super(message);

		this.name = this.constructor.name;
		this.message = message;
		this.code = code;

		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor.name);
		} else {
			this.stack = (new Error(message)).stack;
		}
	}

	toJSON(): Object {
		const details = {};

		// $FlowIssue #1323
		Object.getOwnPropertyNames(this).forEach(key => (details[key] = this[key]));

		return details;
	}
}
