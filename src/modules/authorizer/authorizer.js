/* @flow */

import { bus } from '../../core-server';

const rules = [];

rules.push(require('./rules/isBanned').default);

function authorizeEntity(entity, resource) {
	const promise = new Promise((reject, resolve) => {
		const promises = [];

		rules.forEach((rule) => {
			promises.push(rule(entity, resource));
		});

		Promise.all(promises).then(() => {
			resolve();
		}, (reason) => {
			reject(reason);
		});
	});

	return promise;
}

bus.on('change', (changes, next) => {
	const promises = [];

	if (!changes.entities) return next();

	Object.keys(changes.entities).forEach((key) => {
		promises.push(authorizeEntity(changes.entities[key], changes.auth.resource));
	});

	Promise.all(promises).then(() => {
		next();
	}, (reason) => {
		next(new Error(reason));
	});
}, 900);

console.log('authorizer module ready...');
