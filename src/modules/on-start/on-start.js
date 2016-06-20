import { config } from '../../core-server';
import * as pg from '../../lib/pg';
import winston from 'winston';

function reset(tablename) {
	pg.write(config.connStr, [ { $: `UPDATE ${tablename} SET presence=NULL, resources = NULL` } ], (err, results) => {
		if (err) winston.error(err);
		else winston.info('update on ' + tablename, ':', results);
	});
}

[ 'users', 'rels' ].forEach(reset);
