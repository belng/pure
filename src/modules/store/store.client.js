import app from "../../core";
import generate from "../lib/generate.browser.js";
let cache = app.cache, core = app.core;

/* adds functions which only client will use.*/

var createItem = (type, itemObject) => {
	if (!itemObject.body) {
		throw new Error("invalid property body");
	}

	if (!itemObject.parent) {
		throw new Error("invalid property parent");
	}

	var itemObjectEntity = {};

	itemObjectEntity.id = itemObject.id || generate.guid();
	itemObjectEntity.type = type;
	itemObjectEntity.updateTime = itemObjectEntity.createTime = new Date().getTime();
	itemObjectEntity.body = itemObject.body;
	itemObjectEntity.updater = itemObjectEntity.creator = store.get("app", "user");
	itemObjectEntity.meta = {};
	itemObjectEntity.parent = itemObject.parent;
};

cache.createText = (text) => {
	var itemObject = createItem("text", text);
	// any other specific things to do for this type.
	core.emit("setstate", itemObject);
};

cache.createThread = (thread) => {
	var itemObject = createItem("thread", thread);
	// any other specific things to do for this type.
	core.emit("setstate", itemObject);
};

cache.sendAuth = (auth) => {

};

cache.sendPresence = (presence) => {

};

module.exports = cache;
