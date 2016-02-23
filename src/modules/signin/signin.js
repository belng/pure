/* @flow */
import { bus, cache, Constants, config } from '../../core-server';
import winston from 'winston';
import * as pg from '../../lib/pg';
import { user } from '../../models/models';

function getEntityByIdentity(identities, callback) {
	pg.read(config.connStr, {
		$: 'select *, \'user\' as "type"  from users where identities && &{identities}',
		identities
	}, (err, results) => {
		if (err) {
			winston.error(err.message);
			callback(err);
		} else {
			callback(null, results.map(u => new user(u)));
		}
	});
}
// sign with default (HMAC SHA256)
function signinhandler(changes, next) {
	winston.debug('setstate: sign-in module');
	if (changes.auth && changes.auth.signin) {
		if (changes.auth.signin.id) {
			cache.getEntity(changes.auth.signin.id, (err, entity) => {
				if (err) return next(err);
				if (!entity) return next(new Error('INVALID_USERID'));
				changes.app = (changes.app || {}).user = entity.id;
				((changes.response = (changes.response || {})).app || {}).user = entity.id;
				(changes.response.entities = changes.response.entities || {})[entity.id] = entity;
				delete changes.auth.signin;
				return next();
			});
		} else if (changes.auth.signin.identities.length) {
			getEntityByIdentity(changes.auth.signin.identities, (err, entities) => {
				if (err) {
					next(err);
					return;
				}

				if (entities && entities.length) {
					const entity = entities[0];

					(changes.app = (changes.app || {})).user = entity.id;
					changes.response = (changes.response || {});
					(changes.response.app = changes.response.app || {}).user = entity.id;
					(changes.response.entities = changes.response.entities || {})[entity.id] = entity;
					delete changes.auth.signin;
				} else {
					(changes.response.app = (changes.response = (changes.response || {})).app || {}).user = null;
				}
				next();
				return;
			});
		}
	} else {
		next();
		return;
	}
}

bus.on('setstate', signinhandler, Constants.APP_PRIORITIES.AUTHENTICATION_SIGNIN);
winston.info('signin module ready...');
