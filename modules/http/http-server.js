let http = require("http");

module.exports = (core) => {
	let server = http.createServer((req, res) => {
		core.emit("http/request", { req, res }, err => {
			if (!err) return;
			res.writeHead(500);
			res.end(err.message);
		});
	});
	
	core.emit("http/init", server);
	
	server.listen(7528);
};
