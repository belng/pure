"use strict";

let {bus, cache} = require("../../core"),
	Counter = require("../../lib/counter"),
	Relation = require("../../models/Relation"),
	constants = require("../../lib/constants");

bus.on("setstate", (changes, next) => {
	if(!changes.entities) return next();
	let counter = new Counter();
	for (let id in changes.entities) {
		let entity = changes.entities[id],
			text, threadRel, role, user;
		
		if( entity.type === constants.TYPE_TEXTREL && entity.roles.indexOf(constants.ROLE_MENTIONED) > -1 ) {
			text = changes.entities[entity.item];
			role = [constants.ROLE_MENTIONED];
			user = entity.user;
			if(!text) {
				counter.inc()
				cache.getEntity(entity.item, (err, item) => { 
					text = item;
					counter.dec();
				});
			}
		}
		
		if(entity.type === constants.TYPE_TEXT) {
			text = entity;
			role = [constants.ROLE_FOLLOWER];
			user = entity.creator
		}
		
		counter.then(() => {
			threadRel = {
				item: text.parents[0][0],
				user: user,
				type: constants.TYPE_THREADREL,
				roles: role
			}
//			relation = new Relation(threadRel)
			changes.entities[/*relation.getId()*/ user+"_"+text.parents[0][0]] = threadRel;
		});
	}
	next();
//	counter.then(next)
})

