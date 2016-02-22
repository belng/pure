/*
sources:
https://developers.google.com/identity/protocols/OAuth2UserAgent#validatetoken
*/

import fs from 'fs';
import path from 'path';
import winston from 'winston';
import request from 'request';
import handlebars from 'handlebars';
import route from 'koa-route';
import queryString from 'querystring';
import { bus, config, Constants } from './../../core-server';
import encodeURITemplate from '../../lib/encodeURITemplate';

const redirectURL = `https://${config.host}${config.facebook.redirect_path}`;

const SCRIPT_REDIRECT = `\
location.href = 'https://accounts.google.com/o/oauth2/auth?\
scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile&\
client_id=${config.google.client_id}&\
redirect_uri=${redirectURL}&\
response_type=code&access_type=offline`;

const SCRIPT_MESSAGE = `
	var code = (location.search.substring(1).split("&").filter(function(seg) {
		return seg.indexOf("code=") === 0;
	})[0] || "").substr(5);

	window.opener.postMessage({
		type: "auth",
		provider: "google",
		code: code
	}, "*");

	window.close();
`;

// TODO: most of the code is copy paste from facebook module. see if u can avoid that when u get time.
function getTokenFromCode(code) {
	return new Promise((resolve, reject) => {
		request.post({
			uri: 'https://accounts.google.com/o/oauth2/token',
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			body: queryString.stringify({
				code,
				redirect_uri: redirectURL,
				client_id: config.google.client_id,
				client_secret: config.google.client_secret,
				grant_type: 'authorization_code'
			})
		}, (err, res, t) => {
			if (err) throw (err);
			try {
				const tokenBody = JSON.parse(t), token = tokenBody.access_token;

				if (!token) throw new Error('INVALID_ACCESS_TOKEN');
				resolve(token);
			} catch (e) {
				reject(e);
			}
		});
	});
}

function verifyToken(token, appId) {
	return new Promise((resolve, reject) => {
		request(encodeURITemplate `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=accessToken${token}`,
		(err, res /* , body */) => {
			if (err || !res) {
				reject(err, null, null);
				return;
			}

			const response = JSON.parse(res);

			if (response.error) {
				reject(new Error(response.error.message));
				return;
			}
			if (response.audience === appId + '.apps.googleusercontent.com') resolve(token);
			else resolve(null);
		});
	});
}

function getDataFromToken(token) {
	const signin = {};

	return new Promise((resolve, reject) => {
		request(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`, (err, res, body) => {
			try {
				if (err) throw (err);
				const user = JSON.parse(body);

				if (user.error) {
					throw (new Error(user.error || 'ERR_GOOGLE_SIGNIN'));
				} else if (!user.email) {
					throw (new Error(user.error || 'ERR_GOOGLe_SIGNIN_NO_EMAIL'));
				}
	//			response.signin.pictures.push('https://gravatar.com/avatar/' + crypto.createHash('md5').update(user.email).digest('hex') + '/?d=retro');

				(signin.identities = []).push('mailto:' + user.email);
				signin.params = {
					google: {
						accessToken: token,
						verified: true,
						// find out a way to get the name
						picture: user.picture
					}
				};
				resolve(signin);
			} catch (e) {
				reject(e);
			}
		});
	});
}

function googleAuth(changes, next) {
	if (!changes.auth || !changes.auth.google) {
		next();
		return;
	}

	/* TODO: how do we handle auth from already logged in user?*/
	const key = changes.auth.google.code || changes.auth.google.accessToken;

	if (!key) {
		next(new Error('GOOGLE_AUTH_FAILED'));
		return;
	}

	const promise = ((changes.auth.google.code) ? getTokenFromCode(key) : verifyToken(key));

	promise.then((err, token) => {
		if (err) {
			next(err);
			return;
		}

		if (!token) {
			next(new Error('Invalid_FB_TOKEN'));
			return;
		}

		getDataFromToken(token).then((error, response) => {
			if (!response) {
				next(new Error('trouble construct the signin object'));
				return;
			}

			changes.auth.signin = response;
			next();
		}).catch(error => next(error));
	}).catch(error => next(error));
}

bus.on('setstate', googleAuth, Constants.APP_PRIORITIES.AUTHENTICATION_GOOGLE);

const scriptTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, '../../../templates/script.hbs'), 'utf8').toString());

bus.on('http/init', app => {
	app.use(route.get('/r/google/login', function *() {
		this.body = scriptTemplate({
			title: 'Logging in with Google',
			script: SCRIPT_REDIRECT
		});
	}));

	app.use(route.get('/r/google/return', function *() {
		this.body = scriptTemplate({
			title: 'Logging in with Google',
			script: SCRIPT_MESSAGE
		});
	}));
});

winston.info('google module ready...');
