"use strict";

let constants = require("../../lib/constants"), core, bus, cache;
function incCount(entity, n) {
	let type = entity.type, userId = entity.creator, op;
	(function () {
		return new Promise(function(resolve){
			function next (entity, type) {
				let pEntity = cache.getEntity(entity.parents[0]);
				switch(type) {
					case constants.TYPE_TEXT:
						op = {
							text: 1,
							__op__ : { text: [ "inc" ]}
						};
						
						break;
					case constants.TYPE_THREAD:
						op = {
							thread: 1,
							__op__ : { text: [ "inc" ]}
						}
						break;
				}
				
				pEntity.counts.op = op;
				if(pEntity && pEntity.parents && pEntity.parents[0]) {
					next(pEntity, type); // inc count of grandparents
				}
				else {
					resolve();
				}
			}
			next(entity, type)
		});
	})().then(function(){
		let user = cache.getEntity(userId);
		user.counts.op = op;
		n();
	}).catch(n);
}


module.exports = (c) => {
	core = c;
	bus = core.bus;
	cache = core.cache
	bus.on("setstate", (changes, next) => {
		if(changes.entities) {
			let entities = changes.entities;
			for (let id in entities) {
				let entity = entities[id];
				incCount(entity, next);
			}
		}
	}, 100);
}