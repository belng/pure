/* @flow */

/* @flow */
/* Handles server-side rendering of the ReactDOM app */

import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";
import handlebars from "handlebars";
import url from "../lib/url";
import Hello from "./components/views/Hello";

const template = handlebars.compile(fs.readFileSync("./index.hbs").toString());

module.exports = (core: Bus) => {
	core.on("http/request", ({ request, response }) => {
		if (response.finished) return;

		const state = url.parse(request.url);

		if (!state) return;

		// add a few pendingQueries into the state.

		core.emit("state", state, err => {
			if (err) {
				response.writeHead(500);
				response.end("ERR_FETCH " + err.message);
				return;
			}

			const html = template({
				title: state.app.title,
				state,
				app: ReactDOMServer.renderToString(<Hello />)
			});

			response.end(html);
		});
	});
};
