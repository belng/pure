let juri = require("juri")(),
	jsonop = rerquire("jsonop"),
	{queryToKeyrange, keyrangeToQuery} = require("./querykeyrange");

module.exports = class Cache {
	constructor() {
		this.state = {};
		this.listeners = [];
		this.pending = {};
		this.recent = {};
	}
	
	query(key, range, callback) {
		let known = this.state.knowledge[key],
			index = this.state.indexes[key];
		
		if (!callback && this.pending[key + ":" + range]) {
			callback = this.pending[key + ":" + range];
			delete this.pending[key + ":" + range];
		}
		
		/*
			TODO:
			If range is entirely contained in one of the items in known,
			extract the values from the index, return them and invoke the
			callback on setImmediate().
			
			Otherwise, return the available data, add queries for the missing
			ranges to this.state.queries via setState() and add the callback
			to this.pending with the queryKey + ":" + range as propname.
			
			In either case, update this.recent
		*/
	}
	
	setState(c) {
		jsonop(this.state, c);
		if (c.knowledge) {
			/* update indexes */
		}
		if (c.queries) {
			/* iterate over queries; if any of them is a deletion
				then call query() with it to ensure the callback is
				fired.
			*/
		}
		if (Object.keys(this.state.entities).length > this.opts.maxEntities) {
			/* schedule a cleanup. */
		}
		this.listeners.forEach(fn => fn(c));
	}
	
	onChange(fn) { this.listeners.push(fn); }
	
	get() {}
	
	// Convenience methods
	
	getUsers(options, callback) {
		/* todo: from options, calculate key and range */
		query(key, range, callback);
	}
};
