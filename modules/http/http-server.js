import koa from "koa";
import route from "koa-route";
import mount from "koa-mount";
import serve from "koa-static";
import webpack from "webpack";
import webpackDevMiddleware from "koa-webpack-dev-middleware";
import webpackHotMiddleware from "koa-webpack-hot-middleware";
import webpackConfig from "../../webpack.config";
import { home, room, thread } from "./routes";

const app = koa();

app.listen(7528);

if (process.env.NODE_ENV === "production") {
	// Serve files under static/dist for any requests to /dist/
	app.use(mount("/dist", serve("static/dist")));
} else {
	const compiler = webpack(webpackConfig);

	// Enable Webpack Dev Server
	app.use(webpackDevMiddleware(compiler, {
		publicPath: webpackConfig.output.publicPath,
		noInfo: true
	}));

	// Enable Hot reloading
	app.use(webpackHotMiddleware(compiler));
}

app.use(route.get("/", home));
app.use(route.get("/:room", room));
app.use(route.get("/:room/:thread", thread));
app.use(route.get("/:room/:thread/:title", thread));
