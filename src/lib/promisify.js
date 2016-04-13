/*
 * Converts Node callback API to a Promise based API
 *
 * @flow
 */

type NodeStyleFunction = (options: any, callback: (error: Error, value: any) => void) => any;
type PromisifiedFunction = (options: any) => Promise<any>;

export default function promisify(func: NodeStyleFunction): PromisifiedFunction {
	const promisifiedFunction = (options) => {
		return new Promise((resolve, reject) => {
			func(options, (error, value) => {
				if (error) {
					reject(error);
				} else {
					resolve(value);
				}
			});
		});
	};

	promisifiedFunction.name = func.name + 'Async';

	return promisifiedFunction;
}
