import { bus } from '../../core-server';
import jsonop from 'jsonop';
import * as places from './place';
import { TYPE_ROOM } from '../../lib/Constants';

bus.on('postchange', (changes) => {
	if (!changes.entities) return;
	for (const i in changes.entities) {
		const entity = changes.entities[i];
		if (entity.type !== TYPE_ROOM ||
			!entity.createTime ||
			entity.createTime === entity.updateTime ||
			!entity.identities ||
			!entity.identities.length
		) continue;

		places.callApi('place/details', {
			placeid: entity.identities[0]
		}).then(place => {
			if (place && place.photos) {
				const photos = place.photos;
				const newEntity = jsonop(entity, {
					meta: {
						photos
					}
				});

				bus.emit('change', {
					entities: {
						[newEntity.id]: newEntity
					}
				});
			}
		});
	}
});
