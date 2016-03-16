import { Constants, bus } from '../../core-server';
import log from 'winston';

function getScore(params) {
	return 1;
}
bus.on('postchange', (changes) => {
	if (!changes.entities) {
		// next();
		return;
	}

	for (const id in changes.entities) {
		const entity = changes.entities[id];

		if (entity.type === Constants.TYPE_THREAD) {
			console.log("score module", entity);
			entity.score = getScore(entity.updateTime || Date.now());
			console.log("score module", entity);
			changes.entities[id] = entity;
		}

//		if (entity.type === Constants.TYPE_TEXT) {
//			const thread = changes.entities[entity.parents[0]];
//
//			thread.score = getScore(entity.createtime);
//			changes.entities[entity.parents[0]] = thread;
//		}
	}

	// next();
});
log.info('Score module ready.');
