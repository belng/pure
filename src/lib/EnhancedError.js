/* @flow */

export default class EnhancedError extends Error {
	code: string;
	level: ?number;
	data: ?any;

	constructor(message: string, code: string, level?: number = 0, data?: any) {
		super(message);

		this.name = this.constructor.name;
		this.message = message;
		this.code = code;
		this.level = level;
		this.data = data;

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
