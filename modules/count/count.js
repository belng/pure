"use strict";

const { TABLES, COLUMNS, TYPES, ROLES } = require("../../lib/schema");
let constants = require("../../lib/constants"),
	Counter = require("../../lib/counter"),
	{ bus, cache } = require("../../core");


bus.on("setstate", (changes, next) => {
	if(!changes.entities) return;
	
	let counter = new Counter();
	
	for (let id in changes.entities) {
		let entity = changes.entities[id];
		
		// 1. Increment children counts on parents
		if (
			entity.type === constants.TYPE_TEXT ||
			entity.type === constants.TYPE_THREAD
		) {
			let inc;
			
			if (entity.createtime) {
				inc = 1;
			} else if (entity.deletetime) {
				inc = -1;
			} else {
				continue;
			}
			
			let parent = changes.entities[entity.parents[0][0]] || {};
			
			parent.counts = parent.counts || {};
			parent.counts.children = inc;
			parent.id = entity.parents[0][0];
			parent.type = ( entity.type === constants.TYPE_TEXT ) ?
				constants.TYPE_THREAD : constants.TYPE_ROOM;
			changes.entities[entity.parents[0][0]] = parent;

			// 2. Increment text/thread count of user

			let user = changes.entities[entity.creator] || {};
			user.counts = user.counts || {};
			user.counts[TABLES[entity.type]] = inc;
			user.id = entity.creator;
			changes.entities[entity.creator] = user;
		}

		 // 3. Increment related counts on items

		if (
			entity.type === constants.TYPE_TEXTREL ||
			entity.type === constants.TYPE_THREADREL ||
			entity.type === constants.TYPE_ROOMREL ||
			entity.type === constants.TYPE_PRIVREL ||
			entity.type === constants.TYPE_TOPICREL
		) {
			let item = changes.entities[entity.item] || {};
			
			item.counts = item.counts || {};
			
			if (entity.__op__ && entity.__op__.role && entity.__op__.roles[0] === "union") {
				let rem = entity.__op__.roles[0].slice(1);
				rem.forEach((role) => {
					if (ROLES[role]) {
						item.counts[ROLES[role]] = -1
					}
				});
			}
			
			entity.roles.forEach((role) => {
				if (ROLES[role]) {
					item.counts[ROLES[role]] = 1;
				}
			})
			
			item.id = entity.item;

			switch(entity.type) {
				case constants.TYPE_TEXTREL:
					item.type = constants.TYPE_TEXT;
					break;
				case constants.TYPE_THREADREL:
					item.type = constants.TYPE_THREAD;
					break;
				case constants.TYPE_ROOMREL:
					item.type = constants.TYPE_ROOM;
					break;
				case constants.TYPE_PRIVREL:
					item.type = constants.TYPE_PRIV;
					break;
				case constants.TYPE_TOPICREL:
					item.type = constants.TYPE_TOPIC;
					break;
			}

			changes.entities[entity.item] = item;
		}
	}
	next();
}, "modifier");
