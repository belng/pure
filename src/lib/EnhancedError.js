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

	toJSON: Function = (): Object => {
		const details = {};

		Object.getOwnPropertyNames(this).forEach(key => {
			if (key !== 'toJSON') {
				// $FlowIssue #1323
				details[key] = this[key];
			}
		});

		return details;
	};
}
