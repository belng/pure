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
import { bus } from "../../core";

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

	// Serve files under static/tests for any requests to /tests/
	app.use(mount("/tests", serve("static/tests"), { defer: true }));
}

app.httpServer = httpServer;
bus.emit("http/init", app);

// Serve files under static/dist for any requests to /dist/
app.use(mount("/dist", serve("static/dist"), { defer: true }));
app.use(route.get("/", home));
app.use(route.get("/:room", room));
app.use(route.get("/:room/:thread", thread));
app.use(route.get("/:room/:thread/:title", thread));
