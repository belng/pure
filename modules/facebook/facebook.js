import route from "koa-route";

var core = require("./../../core.js"), request = require("request"),
	fs = require("fs"), bus= core.bus, config = core.config,
	returnTemplate, loginTemplate,
	handlebars = require("handlebars");

function getTokenFromCode(code, secret, clientID, host) {
	console.log(arguments);
	return new Promise(function (resolve, reject) {
		request("https://graph.facebook.com/oauth/access_token?client_id=" + clientID +
		"&redirect_uri=https://" + host + "/r/facebook/return" +
		"&client_secret=" + secret +
		"&code=" + code,
		function(err, res, body) {
			var queries = body.split("&"), i, l, token;
			if (err) {
				console.log(err);
				return reject(err);
			}
			console.log(queries);
			for (i = 0, l = queries.length; i < l; i++) {
				if (queries[i].indexOf("access_token") >= 0) {
					token = queries[i].replace("access_token=", "");
					break;
				}
			}

			console.log(token);
			resolve(token);
		});
	});
}

function verifyToken(token, appId) {
	return new Promise(function (resolve, reject) {
		request("https://graph.facebook.com/app/?access_token=" + token,
		function(err, res, body) {
			var response;
			if (err || !res) {
				return reject(err);
			}

			response = JSON.parse(res);
			if (response.error) return reject(new Error(response.error.message));

			if (response.id === appId) resolve(token);
			else reject(new Error("incorrect appid"));
		});
	});
}

function getDataFromToken(token) {
	var signin = {};
	return new Promise(function(resolve, reject) {
		request("https://graph.facebook.com/me?access_token=" + token, function(err, res, body) {
			var user;

			try {
				if (err) throw err;
				user = JSON.parse(body);

				if (user.error) {
					throw (new Error(user.error || "ERR_FB_SIGNIN"));
				} else if (!user.email) {
					throw (new Error(user.error || "ERR_FB_SIGNIN_NO_EMAIL"));
				}
	//			response.signin.pictures.push('https://gravatar.com/avatar/' + crypto.createHash('md5').update(user.email).digest('hex') + '/?d=retro');

				(signin.identities = []).push("facebook:" + user.id);
				signin.identities.push("mailto:" + user.email);

				signin.params = {
					facebook: {
						facebookID: user.id,
						accessToken: token,
						name: user.first_name + user.middle_name + user.last_name,
						timezone: user.timezone,
						verified: true,
						picture: "https://graph.facebook.com/" + user.id + "/picture?type=square"
					}
				};
				console.log(signin);
				resolve(signin);
			} catch (e) {
				reject(e);
			}
		});
	});
}

function fbAuth(changes, next) {
	var key, promise;
	if (!changes.auth || !changes.auth.facebook) return next();

	/* TODO: how do we handle auth from already logged in user?*/
	key = changes.auth.facebook.code || changes.auth.facebook.accessToken;
	if (!key) return next(new Error("FACEBOOK_AUTH_FAILED"));

	promise = ((changes.auth.facebook.code) ? getTokenFromCode(key, config.facebook.client_secret, config.facebook.client_id, config.host) : verifyToken(key, config.facebook.client_id));

	promise.then(function(token) {
		console.log(arguments);
		if (!token) return next(new Error("Invalid_FB_TOKEN"));
		getDataFromToken(token).then(function(response) {
			if (!response) return next(new Error("trouble construct the signin object"));
			changes.auth.signin = response;
			next();
		}).catch(function(error) {
			return next(error);
		});
	}).catch(function(err) {
		return next(err);
	});
}

bus.on("setstate", fbAuth, 900);
returnTemplate = handlebars.compile(fs.readFileSync(__dirname + "/facebook-return.hbs", "utf8"));
loginTemplate = handlebars.compile(fs.readFileSync(__dirname + "/facebook-login.hbs", "utf8"));

bus.on("http/init", app => {	
	app.use(route.get("/r/facebook/login", function *() {
		this.body = loginTemplate({
			client_id: config.facebook.client_id,
			redirect_uri: "https://" + config.host + "/r/facebook/return"
		});
	}));

	app.use(route.get("/r/facebook/return", function *() {
		this.body = returnTemplate({});
	}));
});

console.log("facebook module ready...");
