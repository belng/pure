const Cache = require("sbcache"), cache = new Cache();

cache.getThreadById = function(threadId) {
	return this.getEntity(threadId);
};

cache.getTextById = function(textId) {
	return this.getEntity(textId);
};

cache.getRelation = function(roomId, userId) {
	return this.getEntity(userId + "_" + roomId);
};

cache.getRoom = function(id) {
	return this.getEntity(id);
};

cache.getUserRole = function(userId, roomId) {
	let rel, role, uId;

	uId = (typeof userId === "string") ? userId : this.get("user");
	rel = this.getRelation(roomId, uId);

	if (rel && rel.role && rel.role !== "none") {
		role = rel.role;
	} else {
		role = (!uId || userUtils.isGuest(uId)) ? "guest" : "registered";
	}
	return role;
};

cache.getTexts = function(roomId, threadId, time, r) {
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
	return this.cache.query(key, range);
};

cache.getThreads = function(roomId, time, r) {
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
	return this.cache.query(key, range);
};

cache.getNearByRooms = function() {
	return this.get("app", "nearByRooms");
};

cache.getUser = function(id) {
	const userObj = this.getEntity(id || this.get("app", "user"));

	if (typeof userObj === "object") {
		if (userObj.type === "user") {
			return userObj;
		}
	} else {
		return userObj;
	}
};

cache.isUserAdmin = function(userId, roomId) {
	const role = this.getUserRole(userId, roomId);
	return permissionWeights[role] >= permissionWeights.moderator;
};

cache.isUserBanned = function(userId, roomId) {
	const role = this.getUserRole(userId, roomId);Store.prototypeStore.prototypeStore.prototypeStore.prototypeStore.prototypeStore.prototypeStore.prototype
	return permissionWeights[role] <= permissionWeights.banned;
};

cache.isRoomReadable = function(roomId, userId) {
	const roomObj = this.getRoom(roomId);
	const readLevel = (roomObj && roomObj.guides && roomObj.guides.authorizer &&
						roomObj.guides.authorizer.readLevel) ? roomObj.guides.authorizer.readLevel : "guest";

	return (permissionWeights[this.getUserRole(userId, roomId)] >= permissionWeights[readLevel]);
};

cache.isHidden = function(text) {
	const { tags } = text;

	if (Array.isArray(tags) && (tags.indexOf("thread-hidden") > -1 || tags.indexOf("hidden") > -1 || tags.indexOf("abusive") > -1)) {
		return true;
	}

	return false;
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

module.exports = Store;

module.exports = function(core, config) {
	const store = new Store();
	require("./state-manager")(core, config, store, state);
	require("./action-handler")(core, config, store, state);
	require("./rule-manager")(core, config, store, state);
	require("./socket")(core, config, store, state);
	require("./session-manager")(core, config, store, state);
	return store;
};


module.exports = cache;