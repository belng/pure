import { Constants, bus } from '../../core-server';
import log from 'winston';

function getScore() {
	return 1;
}

bus.on('change', (changes) => {
	if (!changes.entities) {
		return;
	}

	for (const id in changes.entities) {
		const entity = changes.entities[id];

		if (entity.type === Constants.TYPE_THREAD) {
			entity.score = getScore(entity.updateTime || Date.now());
		}

//		if (entity.type === Constants.TYPE_TEXT) {
//			const thread = changes.entities[entity.parents[0]];
//
//			thread.score = getScore(entity.createtime);
//			changes.entities[entity.parents[0]] = thread;
//		}
	}
});

log.info('Score module ready.');
