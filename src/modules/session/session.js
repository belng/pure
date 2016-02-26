/* @flow */
import jwt from 'jsonwebtoken';
import { bus, config, Constants } from '../../core-server';
import winston from 'winston';

// sign with default (HMAC SHA256)
const TOKEN_VALIDITY = 604800; // default seven days.
const ISSUER = config.host;
const AUDIENCE = config.host;
const KEY = config.session.private_key;

function getIDFromSession(session) {
	return new Promise((resolve, reject) => {
		jwt.verify(session, KEY, { aud: AUDIENCE }, (err, decoded) => {
			if (err) {
				reject(err);
			} else {
				resolve(decoded.sub);
			}
		});
	});
}

function generateSession(sub) {
	return new Promise((resolve) => {
		jwt.sign({
			iss: ISSUER, sub, aud: AUDIENCE,
			iat: Math.floor((new Date()).getTime() / 1000),
			exp: Math.floor((new Date()).getTime() / 1000) + TOKEN_VALIDITY
		}, KEY, {
			algorithm: 'HS256',
			type: 'JWS'
		}, (session) => {
			resolve(session);
		});
	});
}

function sessionHandler(changes, next) {
	const signin = {};

	winston.info('setstate: session module listener 1');

	if (changes.auth && changes.auth.session) {
		getIDFromSession(changes.auth.session)
		.then((sub) => {
			winston.debug('signing in as ', sub);
			changes.auth.user = sub;
			changes.auth.signin = signin;
			signin.id = sub;
			signin.params = {};
			next();
		})
		.catch(next);
	} else {
		next();
	}
}

bus.on('change', sessionHandler, Constants.APP_PRIORITIES.AUTHENTICATION_SESSION);
bus.on('change', (changes, next) => {
	winston.debug('setstate: session module listener 2');
	if (changes.response && changes.response.app && changes.response.app.user) {
		winston.info('setstate: session module listener 2', changes.response.app.user);
		generateSession(changes.response.app.user).then((session) => {
			winston.debug('setstate: session module listener 2', session);
			changes.response.app.session =	session;
			next();
		});
	} else {
		next();
	}
}, Constants.APP_PRIORITIES.AUTHENTICATION_SESSION_2);

winston.info('session module ready...');
