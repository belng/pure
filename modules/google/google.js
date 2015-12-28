/*
sources:
https://developers.google.com/identity/protocols/OAuth2UserAgent#validatetoken
*/
var app = require("./../../app.js"), request = require("request"),
	loginTemplate, returnTemplate, handlebars = require("handlebars");

// TODO: most of the code is copy paste from facebook module. see if u can avoid that when u get time.
function getTokenFromCode(code, secret, cliendID, host) {
	return new Promise (function (resolve) {
		
		(action.auth && action.auth.google && action.auth.google.code) {
			request.post({
				uri: "https://accounts.google.com/o/oauth2/token",
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				body: require('querystring').stringify({
					code: action.auth.google.code,
					redirect_uri: "https://" + config.global.host + "/r/google/return",
					client_id: config.client_id,
					client_secret: config.client_secret,
					grant_type: "authorization_code"
				})
			}, function(err, res, tokenBody) {
				if (err) throw(err);
				try {
					tokenBody = JSON.parse(tokenBody);
					var token = tokenBody.access_token;
					if(!token) throw new Error("INVALID_ACCESS_TOKEN");
					resolve(token);
				} catch (e) {
					resolve(e);
				}
			});

			
		});
	});
}

function verifyToken(token, appId) {
	return new Promise (function (resolve) {
		request("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=accessToken" + token,
		function(err, res, body) {
			var response;
			if (err || !res) {
				action.response = err;
				return resolve(err, null, null);
			}

			response = JSON.parse(res);
			if(response.error) return resolve(new Error(response.error.message));

			if(response.audience === appId+".apps.googleusercontent.com") resolve(null, token);
			else resolve(null, "");
		});
	});
}

function getDataFromToken(token) {
	var signin = {};
	return new Promise(function(resolve) {
		request("https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + token, function(err, res, body) {
			var user, gravatar, fbpic, sendUpdate = false;
			delete action.auth.facebook.code;

			try {
				if (err) throw(err);
				user = JSON.parse(body);

				if (user.error) {
					log.i("google login failed: ", body);
					throw(new Error(user.error || "ERR_GOOGLE_SIGNIN"));
				} else if (!user.email) {
					log.i("Google login failed: ", body);
					throw(new Error(user.error || "ERR_GOOGLe_SIGNIN_NO_EMAIL"));
				}
	//			response.signin.pictures.push('https://gravatar.com/avatar/' + crypto.createHash('md5').update(user.email).digest('hex') + '/?d=retro');

				(signin.identities = []).push("mailto:"+user.email);

				signin.params = {
					google: {
						accessToken: token,
						verified: true,
						//find out a way to get the name
						picture: user.picture
					}
				};
				resolve(null, signin)
			} catch (e) {
				resolve(e, null);
			}
		});
	});
}
	
function googleAuth(changes, next) {
	var key, promise;
	if(!changes.auth || !changes.auth.facebook ) return next();
	/*TODO: how do we handle auth from already logged in user?*/
	key = changes.auth.facebook.code || changes.auth.facebook.accessToken;
	if(!key) return next(new Error("FACEBOOK_AUTH_FAILED"));
	
	promise = ((change.auth.facebook.code)? getTokenFromCode(key, config.facebook.client_secret, config.facebook.client_id, config.host): verifyToken(key, config.facebook.client_id));
	
	promise.then(function(err, token) {
		if(err) return next(err);
		if(!token) return next(new Error("Invalid_FB_TOKEN"));
		getDataFromToken(token).then(function(err, response) {
			if(err) return next(err);
			else if(!response) return next(new Error("trouble construct the signin object"));
			changes.auth.signin = response;
			next();
		});
	});
}
function oAuthRedirect(http, next) {
	var path = http.req.path.substring(3);
	path = path.split("/");
	if (path[0] === "google") {
		if (path[1] === "login") {
			return http.res.end(loginTemplate({
				client_id: config.google.client_id,
				redirect_uri: "https://" + config.host + "/r/facegoogle/return"
			}));
		} else if (path[1] === "return") {
			http.res.end(returnTemplate({}));
		}
	}
}

module.exports = function() {
	core.on("setstate", googleAuth, 900);
	returnTemplate = handlebars.compile(fs.readFileSync(__dirname + "/google-return.hbs", "utf8"));
	loginTemplate = handlebars.compile(fs.readFileSync(__dirname + "/google-login.hbs", "utf8"));
	app.core.on("http/request", oAuthRedirect, 1000);
};