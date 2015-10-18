/* Handles server-side rendering of the ReactDOM app */

let url = require("../../lib/url"),
	ReactDomServer = require("react-dom/server"),
	template = require("handlebars").compile(require("fs").readFileSync("./index.hbs"));

module.exports = (core) => {
	let App = require("./components/app")(core);
	
	core.on("http/request", ({ request, response }) => {
		if (response.finished) return;
		
		let state = url.parse(request.url);
		if (!state) return;
		
		// add a few pendingQueries into the state.
		
		core.emit("state", state, err => {
			if (err) {
				response.writeHead(500);
				response.end("ERR_FETCH " + err.message);
				return;
			}
			
			let html = template({
				title: state.app.title,
				state: state,
				app: ReactDomServer.renderToString(<App />)
			});
			
			response.end(html);
		});
	});
};
