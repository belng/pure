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

	winston.debugq('setstate: session module');
	if (changes.auth && changes.auth.session) {
		getIDFromSession(changes.auth.session)
		.then((sub) => {
			changes.auth.user = sub;
			signin.id = sub;
			signin.params = {};
			next();
		})
		.catch(next);
	} else {
		next();
	}
}

bus.on('setstate', sessionHandler, Constants.APP_PRIORITIES.AUTHENTICATION_SESSION);
bus.on('setstate', (changes, next) => {
	if (changes.response && changes.response.app && changes.response.app.user) {
		generateSession(changes.response.app.user).then((session) => {
			changes.response.app.session =	session;
			next();
		});
	}
}, 'modifier');

winston.info('session module ready...');
