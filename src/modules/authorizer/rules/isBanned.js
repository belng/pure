import { cache, Constants } from '../../../core-server';

export default function(user, entity) {
	return new Promise((resolve, reject) => {
		cache.getRelation(user, entity, (err, relation) => {
			if (err) return reject(err);
			if (relation.role === Constants.ROLE_BANNED) return reject('banned');
			resolve();
		});
	});
}
