import { bus } from '../../core-server';
import winston from 'winston';
import * as places from '../../lib/places';
import { TYPE_ROOM } from '../../lib/Constants';
import * as models from '../../models/models';
import * as upload from '../../lib/upload';

function addMeta(room) {
	places.getPlaceDetails(room.identities[0])
	.then(e => {
		const newRoom = {
			...room
		};
		newRoom.params = newRoom.params || {};
		newRoom.params.placeDetails = e;
		return new models.room(newRoom);
	});
}

function saveEntity(entity) {
	setTimeout(() => {
		bus.emit('change', {
			entities: {
				[entity.id]: entity
			}
		});
	}, 60 * 1000);
}

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


		addMeta(entity).then(newEntity => {
			const params = newEntity.params;
			if (
				params.placeDetails &&
				params.placeDetails.photos &&
				params.placeDetails.photos.length
			) {
				const reference = params.placeDetails.photos[0].photo_reference;
				places.getPhotoFromReference(reference, 300).then(photo => {
					newEntity.meta = newEntity.meta || {};
					newEntity.meta.photo = newEntity.meta.photo || {};
					newEntity.meta.photo.attributions = params.placeDetails.photos[0].html_attributions;
					newEntity.meta.photo.height = params.placeDetails.photos[0].height;
					newEntity.meta.photo.width = params.placeDetails.photos[0].width;
					return upload.urlTos3(photo.location, 'b/' + i + '/image.jpg');
				}).then(() => {
					newEntity.meta.photo.url = 'b/' + i + '/image.jpg';
					saveEntity(newEntity);
				});
			} else {
				saveEntity(newEntity);
			}
		}).catch(err => {
			winston.info('Error getting photo: ', err.message);
		});
	}
});
