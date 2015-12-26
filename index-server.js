import koa from "koa";
import route from "koa-route";
import mount from "koa-mount";
import serve from "koa-static";
import webpack from "webpack";
import webpackDevMiddleware from "koa-webpack-dev-middleware";
import webpackHotMiddleware from "koa-webpack-hot-middleware";
import React from "react";
import ReactDOMServer from "react-dom/server";
import ServerHTML from "./ui/ServerHTML";
import Hello from "./ui/components/views/Hello";
import webpackConfig from "./webpack.config";

const app = koa();

app.use(route.get("/", function* () {
	this.body = "<!DOCTYPE html>" + ReactDOMServer.renderToStaticMarkup(
		<ServerHTML
			locale="en"
			title="React Bolierplate"
			description="Simple boilerplate for React"
			body={ReactDOMServer.renderToString(<Hello radiumConfig={{ userAgent: this.headers["user-agent"] }} />)}
		/>
	);
}));

if (process.env.NODE_ENV === "production") {
	app.use(mount("/dist", serve("static/dist")));
} else {
	const compiler = webpack(webpackConfig);

	app.use(webpackDevMiddleware(compiler, {
		publicPath: webpackConfig.output.publicPath,
		noInfo: true
	}));

	app.use(webpackHotMiddleware(compiler));
}

app.listen(7528);
