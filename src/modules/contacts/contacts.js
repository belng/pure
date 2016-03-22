import { bus, Constants, config } from '../../core-server';
import * as pg from './../../lib/pg';
import EnhancedError from './../../lib/EnhancedError';

export function buildSql(message, time) {
	const referrer = message.auth.user, sql = [], valuePart = [];

	sql.push('INSERT INTO contacts(referrerm createtime, contact) values');
	message.contacts.forEach(contact => {
		valuePart.push({
			$: '(&(referrer), &(createtime), &(contact))',
			referrer,
			createtime: time,
			contact
		});
	});

	sql.push(pg.cat(valuePart, ','));
	return pg.cat(sql);
}

bus.on('contacts', (message, next) => {
	const sql = buildSql(message, Date.now());
	pg.write(config.connStr, sql, (err) => {
		if (err) {
			message.response = message.response || {};
			message.response.error = new EnhancedError(
				err.message,
				'PG_WRITE_FAILED'
			);
			return next(message.response.error);
		}

		return next();
	});
}, Constants.APP_PRIORITIES.CONTACTS);
