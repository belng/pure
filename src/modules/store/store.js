import {cache} from '../../app';

cache.getThreadById = function(threadId, callback) {
	return this.getEntity(threadId, callback);
};

cache.getTextById = function(textId, callback) {
	return this.getEntity(textId, callback);
};

cache.getRelation = function(roomId, userId, callback) {
	return this.getEntity(userId + "_" + roomId, callback);
};

cache.getRoom = function(id, callback) {
	return this.getEntity(id, callback);
};

cache.getTexts = function(roomId, threadId, time, r, callback) {
	const q = {}, range = [];
	let key;

	q.type = "text";
	q.filter = {
		to: roomId, thread: threadId
	};
	range.push(time);
	if (range < 0) {
		range.push(-r);
		range.push(0);
	} else {
		range.push(0);
		range.push(r);
	}
	q.order = "time";
	key = this.cache.sliceToKey(q);
	return this.cache.query(key, range, callback);
};

cache.getThreads = function(roomId, time, r, callback) {
	const q = {}, range = [];
	let key;

	q.type = "text";
	q.filter = {
		to: roomId
	};
	range.push(time);
	if (range < 0) {
		range.push(-r);
		range.push(0);
	} else {
		range.push(0);
		range.push(r);
	}
	q.order = "startTime";
	key = this.cache.sliceToKey(q);
	return this.cache.query(key, range, callback);
};

cache.getNearByRooms = function() {
	return this.get("app", "nearByRooms");
};

cache.getUser = function(id) {
	const userObj = this.getEntity(id || this.get("app", "user"), callback);

	if (typeof userObj === "object") {
		if (userObj.type === "user") {
			return userObj;
		}
	} else {
		return userObj;
	}
};

cache.getRelatedEntity = function(type, id, f) {
	const q = {}, range = [ 0, 0, 60 ], results = [];
	let entityId, key, items, filter = f;

	if (typeof id === "string") {
		entityId = id;
	} else if (typeof id === "object") {
		entityId = this.get("app", "nav", type === "user" ? "room" : "user");
		filter = id;
	} else {
		entityId = this.get("app", "nav", type === "user" ? "room" : "user");
	}

	q.type = "relation";
	q.filter = filter;
	filter.room = entityId;

	q.order = "roleTime";
	key = this.cache.sliceToKey(q);
	items = this.cache.query(key, range);

	if (Array.isArray(items)) {
		items.forEach(relation => {
			let entity, filterKeys, i;

			if (filter) {
				filterKeys = Object.keys(filter);

				for (i = 0; i < filterKeys.length; i++) {
					if (filter[filterKeys] !== relation[filterKeys]) {
						return;
					}
				}
			}

			entity = this["get" + (type === "user" ? "Room" : "User")](relation[type]);

			results.push(objUtils.merge(objUtils.clone(relation), entity));
		});
	}

	return results;
};

module.exports = cache;
