import { Constants, bus } from '../../core-server';

function getScore(params) {
	return Math.log(params);
}
bus.on('setstate', (changes, next) => {
	if (!changes.entities) return next();

	for (const id in changes.entities) {
		const entity = changes.entities[id];

		if (entity.type === Constants.TYPE_THREAD) {
			entity.score = getScore(entity.updateTime);
			changes.entities[id] = entity;
		}

//		if (entity.type === Constants.TYPE_TEXT) {
//			const thread = changes.entities[entity.parents[0]];
//
//			thread.score = getScore(entity.createtime);
//			changes.entities[entity.parents[0]] = thread;
//		}
	}

	next();
});
