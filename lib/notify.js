/*
	Accepts entity changes, the cache and options, returns a stream of notify objects.
	{ user, resource, censored_change, noteType, score }

	Used by:
	- store, to get userIds whose status is lower than "reading".
	- socket, to get current server resourceIDs with status "online" or higher.
	- push, to get users with push ids whose status is lower than "online"
	- email, to get

	Options include filtering by gateway (the prefix of the identity) and minimum score.
*/
var pg = require("./pg.js");

function getNotifyStream(item) {
	var outStream = new EventEmitter(), pgStream;
	var query = {}, parts = [];
	/*
		construct the query.
	*/
	
	parts.push({
		$: "select * from relations where "
	});
	
	pgStream = pg.readStream(connStr, query);
	
	pgStream.on("end", function (result) {
		outStream.emit("row", row, result);
	});

	pgStream.on("end", function (result) {
		outStream.emit("end", result);
	});
	return outStream;
}
module.exports = function notify (changes, cache, options) {
	var outStreams = [];
	for (let itemId in changes.entities) outStreams.push(getNotifyStream(changes.entities[itemId]));
	return outStreams;
};

/*
	What all triggers notify.
	update/create of entities and relations.
	so we will have to figure out which are the ones to send notification?
	will this result in spliting setstate into multiple setstate? mostly it will be one.
*/