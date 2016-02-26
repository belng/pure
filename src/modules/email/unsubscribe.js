import fs from 'fs';
import jwt from 'jsonwebtoken';
import log from 'winston';
import handlebars from 'handlebars';
import { bus, config } from '../../core-server';

const template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/unsubscribe.hbs', 'utf8').toString());

function handleRequest (req, res) {
	let decoded, emailAddress;

	// extract the Email address from the request
	try {
		decoded = jwt.verify(req.query.email, config.secret);

	} catch (e) {
		log.i('Invalid unsubscribe JWT: ' + req.query.email);
		res.end(template({
			message: 'You were not unsubscribed because the unsubscribe link has expired. Please click the link on a newer email.'
		}));
	}
	emailAddress = decoded.email;

	// search the database and find the user with this email
	bus.emit('getUsers', {
		identity: 'mailto:' + emailAddress,
		session: 'internal/unsubscribe'
	}, (err, query) => {
		if (err) {
			return res.end(template({
				message: 'Sorry, an internal server error prevented you from being unsubscribed.'
			}));
		}

		if (!query.results || !query.results.length) {
			return res.end(template({
				message: 'User does not exist.'
			}));
		}

		// Received the user from the database! Changing the settings...
		const user = query.results[0];

		user.params.email = user.params.email || {};
		user.params.email.frequency = 'never';
		user.params.email.notifications = false;


		// Saving the saved settings back into the database.
		bus.emit('user', {
			to: user.id,
			user,
			session: 'internal/unsubscribe'
		}, (e) => {
			if (e) {
				return res.end(template({
					message: 'Sorry, an internal server error prevented you from being unsubscribed.'
				}));
			}
			res.header('Content-Type', 'text/html');
			res.end(template({
				message: 'You have been unsubscribed.'
			}));
		});
	});
}

bus.on('http/init', (payload) => {
	payload.push({
		get: {
			'/r/unsubscribe': handleRequest
		}
	});
});
