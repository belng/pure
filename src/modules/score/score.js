import { bus, cache } from '../../core-server';
import { TYPE_THREAD, TAG_POST_STICKY, APP_PRIORITIES } from '../../lib/Constants';
import Counter from '../../lib/counter';
import log from 'winston';
import jsonop from 'jsonop';

function getScore(entity) {
	let upvote = typeof (entity.counts.upvote) === 'number' ? entity.counts.upvote : 0,
		children = typeof (entity.counts.children) === 'number' ? entity.counts.children : 0,
		follower = typeof (entity.counts.follower) === 'number' ? entity.counts.follower : 0;

	const updateTime = (entity.updateTime - 1.45E12) / 600000,
		createTime = (entity.createTime - 1.45E12) / 600000;

	upvote = 2 * Math.atan(upvote / 1) / Math.PI;
	children = 2 * Math.atan(children / 5) / Math.PI;
	follower = 2 * Math.atan(follower / 3) / Math.PI;

	console.log('score module: ', entity);

	const score = 0.7 * updateTime + 0.3 * createTime +
	10 * upvote + 5 * children + 7.5 * follower +
	1E9 * (entity.tags && entity.tags.indexOf(TAG_POST_STICKY) > -1 ? 1 : 0); // for pinned posts

	console.log('score: ', score);
	return score;
}

bus.on('change', (changes, next) => {
	if (!changes.entities) {
		next();
		return;
	}
	const counter = new Counter();
	for (const id in changes.entities) {
		const entity = changes.entities[id];

		if (entity.type === TYPE_THREAD) {
			console.log('score module:1 ', entity);
			counter.inc();
			cache.getEntity(entity.id, (err, result) => {
				if (err) {
					counter.err();
					return;
				}
				const newThread = jsonop.apply(entity, result || {});
				console.log('result: ',result);
				console.log('newThread: ', newThread)
				entity.score = getScore(newThread);
				console.log('score now: ', entity);
				counter.dec();
			});
		}
	}
	counter.then(() => {
		next();
	});
}, APP_PRIORITIES.SCORE);

log.info('Score module ready.');
