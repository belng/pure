import { bus, Constants, config } from '../../core-server';
import * as pg from './../../lib/pg';
import EnhancedError from './../../lib/EnhancedError';
import route from 'koa-route';

export function buildSql(user, contacts, time) {
	const sql = [], valuePart = [];

	sql.push('INSERT INTO contacts(referrer, createtime, contact) values');
	contacts.forEach(contact => {
		valuePart.push({
			$: '(&(referrer), &(createtime), &(contact))',
			referrer: user,
			createtime: time,
			contact
		});
	});

	sql.push(pg.cat(valuePart, ','));
	return [ pg.cat(sql) ];
}

function saveContacts(sql) {
	return new Promise((resolve, reject) => {

		pg.write(config.connStr, sql, (err, results) => {
			if (err) {
				return reject(err);
			}
			return resolve(results);
		});
	});
}

bus.on('contacts', (message, next) => {
	const sql = buildSql(message.auth.user, message.contacts, Date.now());
	saveContacts(sql).then(next).catch(err => {
		message.response = message.response || {};
		message.response.error = new EnhancedError(
			err.message,
			'PG_WRITE_FAILED'
		);
		return next(message.response.error);
	});
}, Constants.APP_PRIORITIES.CONTACTS);

function getUser(session) {
	return new Promise((resolve, reject) => {
		bus.emit('change', {
			auth: {
				session
			}
		}, (err, change) => {
			if (err) {
				reject(err);
			} else {
				resolve(change.response.state.user);
			}
		});
	});
}

function handleContacts(session, contacts) {
	return new Promise((resolve, reject) => {
		getUser(session).then(user => {
			const sql = buildSql(user, contacts, Date.now());
			saveContacts(sql).then(() => {
				resolve({
					success: true
				});
			}).catch(e => {
				reject({
					success: false,
					message: e.message
				});
			});
		}).catch(e => {
			reject({
				success: false,
				message: e.message
			});
		});
	});


}
bus.on('http/init', app => {
	app.use(route.post('/x/contacts', function *() {
		const request = this.request.body;
		try {
			const res = yield handleContacts(request.session, request.data);
			this.body = res;
		} catch (e) {
			this.body = e;
		}
	}));
});
