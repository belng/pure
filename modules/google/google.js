/*
sources:
https://developers.google.com/identity/protocols/OAuth2UserAgent#validatetoken
*/

import fs from 'fs';
import request from 'request';
import handlebars from 'handlebars';
import route from 'koa-route';
import queryString from 'querystring';
import { bus, config } from './../../core';

let loginTemplate, returnTemplate;

// TODO: most of the code is copy paste from facebook module. see if u can avoid that when u get time.
function getTokenFromCode(code) {
	return new Promise(function (resolve, reject) {
		request.post({
			uri: "https://accounts.google.com/o/oauth2/token",
			headers: {
				"content-type": "application/x-www-form-urlencoded"
			},
			body: queryString.stringify({
				code: code,
				redirect_uri: "https://" + config.host + "/r/google/return",
				client_id: config.google.client_id,
				client_secret: config.google.client_secret,
				grant_type: "authorization_code"
			})
		}, function(err, res, tokenBody) {
			if (err) throw (err);
			try {
				tokenBody = JSON.parse(tokenBody);
				var token = tokenBody.access_token;
				if (!token) throw new Error("INVALID_ACCESS_TOKEN");
				resolve(token);
			} catch (e) {
				reject(e);
			}
		});
	});
}

function verifyToken(token, appId) {
	return new Promise(function (resolve, reject) {
		request("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=accessToken" + token,
		function(err, res, body) {
			var response;
			if (err || !res) {
				return reject(err, null, null);
			}

			response = JSON.parse(res);
			if (response.error) return reject(new Error(response.error.message));
			if (response.audience === appId + ".apps.googleusercontent.com") resolve(token);
			else resolve(null);
		});
	});
}

function getDataFromToken(token) {
	var signin = {};
	return new Promise(function(resolve, reject) {
		request("https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + token, function(err, res, body) {
			var user;

			try {
				if (err) throw (err);
				user = JSON.parse(body);

				if (user.error) {
					throw (new Error(user.error || "ERR_GOOGLE_SIGNIN"));
				} else if (!user.email) {
					throw (new Error(user.error || "ERR_GOOGLe_SIGNIN_NO_EMAIL"));
				}
	//			response.signin.pictures.push('https://gravatar.com/avatar/' + crypto.createHash('md5').update(user.email).digest('hex') + '/?d=retro');

				(signin.identities = []).push("mailto:" + user.email);
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
	var key, promise;
	if (!changes.auth || !changes.auth.google) return next();

	/* TODO: how do we handle auth from already logged in user?*/
	key = changes.auth.google.code || changes.auth.google.accessToken;
	if (!key) return next(new Error("GOOGLE_AUTH_FAILED"));

	promise = ((changes.auth.google.code) ? getTokenFromCode(key) : verifyToken(key));
	promise.then(function(err, token) {
		if (!token) return next(new Error("Invalid_FB_TOKEN"));
		getDataFromToken(token).then(function(error, response) {
			if (!response) return next(new Error("trouble construct the signin object"));
			changes.auth.signin = response;
			next();
		}).catch(function(error) {
			next(error);
		});
	}).catch(function (error) {
		next(err);
	});
}

bus.on("setstate", googleAuth, 900);
returnTemplate = handlebars.compile(fs.readFileSync(__dirname + "/google-return.hbs", "utf8"));
loginTemplate = handlebars.compile(fs.readFileSync(__dirname + "/google-login.hbs", "utf8"));

bus.on("http/init", app => {
	app.use(route.get("/r/google/login", function *() {
		this.body = loginTemplate({
			client_id: config.google.client_id,
			redirect_uri: "https://" + config.host + "/r/google/return"
		});
	}));

	app.use(route.get("/r/google/return", function *() {
		this.body = returnTemplate({});
	}));
});

console.log("google module ready...");
