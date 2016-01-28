/* @flow */

import koa from "koa";
import http from "http";
import route from "koa-route";
import mount from "koa-mount";
import serve from "koa-static";
import webpack from "webpack";
import webpackDevMiddleware from "koa-webpack-dev-middleware";
import webpackHotMiddleware from "koa-webpack-hot-middleware";
import webpackConfig from "../../webpack.config";
import { home, room, thread } from "./routes";

let core = require("./../../core");
const app = koa(), httpServer = http.createServer(app.callback()).listen(7528);

if (process.env.NODE_ENV !== "production") {
	const compiler = webpack(webpackConfig);
	// Enable Webpack Dev Server
	app.use(webpackDevMiddleware(compiler, {
		publicPath: webpackConfig.output.publicPath,
		noInfo: true
	}));

	// Enable Hot reloading
	app.use(webpackHotMiddleware(compiler));
	// setting the test public folder.
	console.log(process.cwd() + "/test/static")
	app.use(mount("/test", serve("test/static")));
}

app.httpServer = httpServer;
core.bus.emit("http/init", app);


// Serve files under static/dist for any requests to /dist/
app.use(mount("/dist", serve("static/dist"), { defer: true }));
app.use(route.get("/", home));
app.use(route.get("/:room", room));
app.use(route.get("/:room/:thread", thread));
app.use(route.get("/:room/:thread/:title", thread));
