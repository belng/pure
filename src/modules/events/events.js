import route from 'koa-route';
import * as pg from '../../lib/pg';
import winston from 'winston';
import { bus, config } from '../../core-server';

function buildInsert(change) {
	const events = change.events;
	const insert = 'INSERT INTO events("type", "user", "data") VALUES';
	const values = pg.cat(events.map(event => {
		if (!event.user) {
			event.user = change.auth ? change.auth.user : '';
		}

		return {
			$: '(&{type}, &{user}, &{data}::jsonb)',
			type: event.type,
			user: event.user,
			data: event.data
		};
	}), ',');

	return pg.cat([
		insert,
		values,
	], ' ');
}
bus.on('change', (change) => {
	if (!change.events || !change.events.length) return;

	const sql = buildInsert(change);
	pg.write(config.connStr, [ sql ], (err) => {
		if (err) winston.error('Event Module: ', err.message);
		else winston.info('Events registered');
	});
});

bus.on('http/init', app => {
	app.use(route.post('/x/analytics', function *() {
		const body = this.request.body;
		const events = body.event;

		bus.emit('change', {
			events,
			source: 'belong'
		});

		this.body = 'Change Emitted';
	}));
}, 1000);
