onIncomingMessage = (message) => {
	if (mesasge.type === "change") {
		core.emit("change")
	} else if (message.type === "watch") {
		authorizer.authorize
		cache.watch(
	}
}



//---------------------

dispatcher.js
	module1.handle()
	.then(() => {module2.handle});


// ES7 async/await

async function dispatch() {
	await module1.onEvent();
	await module2.onEvent();
}

require("moduleName");



dispatchers/
	changes.js







Current Module contract
Calls bus.on(event, handler : (payload, next) => any) and calls next ONCE.

Proposed Module contract
exports onEvent function that returns a Promise.

exports.onEvent = function () {

	fileWriteStream = ...

	return new Promise(resolve, reject) {
		stream.onEnd(() => resolve(0));
	}
}
