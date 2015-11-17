/*
	Accepts entity changes, the cache and options, returns a stream of notify objects. { user, resource, censored_change, noteType, score }

	Used by:
	- store, to get userIds whose status is lower than "reading".
	- socket, to get current server resourceIDs with status "online" or higher.
	- push, to get users with push ids whose status is lower than "online"
	- email, to get

	Options include filtering by gateway (the prefix of the identity) and minimum score.
*/

module.exports = function notify (changes, cache, options) {
	return/* Stream object */;
};
