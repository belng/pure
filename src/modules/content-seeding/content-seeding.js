/* @flow */
/* eslint-disable no-param-reassign*/
import log from 'winston';
import fs from 'fs';
import uuid from 'node-uuid';
import template from 'lodash/template';
import { bus } from '../../core-server';
import Thread from '../../models/thread';
import * as places from '../../lib/places';
import { TYPE_ROOM,
	TYPE_THREAD,
	TAG_ROOM_AREA,
	TAG_ROOM_CITY,
	TAG_ROOM_SPOT
} from '../../lib/Constants';

type ThreadTemplate = {
	title: string;
	body: string;
	creator: string;
}

const types = [ 'hospital', 'restaurant', 'school', 'grocery_or_supermarket' ];

function tagStringToNumber(tag) {
	switch (tag) {
	case 'city':
		return TAG_ROOM_CITY;
	case 'area':
		return TAG_ROOM_AREA;
	case 'spot':
		return TAG_ROOM_SPOT;
	}
	return '';
}

function seedContent(room) {
	log.info('something:', JSON.stringify(room));
	fs.readdir('./templates/seed-content', (err, files: any) => {
		const changes = {
			entities: {}
		};

		if (err || !files || files.length === 0) return;

		/*
			Split filenames into array of format: [tag, number, option]
			Filter out files that doesn't belong to the current room's tags
		*/
		files = files.map(file => file.split('-'))
		.filter(e => e.length === 3)
		.filter(e => {
			return room.tags.indexOf(tagStringToNumber(e[0])) > -1;
		}
		);

		/*
			group templates into tags.
			format: {
					'area-1': [ ['area', 1, 'a.json'], ['area', 1, 'b.json']]
					'area-2': [ ['area', 2, 'a.json'], ['area', 2, 'b.json']]
			}
		*/
		files = files.reduce((prev, cur) => {
			prev[cur[0] + '-' + cur[1]] = prev[cur[0] + '-' + cur[1]] || [];
			prev[cur[0] + '-' + cur[1]].push(cur);
			return prev;
		}, {});

		// randomly pick a file for each tag:
		files = Object.keys(files).map(e => {
			return files[e][Math.ceil(Math.random() * files[e].length) - 1];
		})
		.map(e => e.join('-')) // get the template filenames back
		.map(e => fs.readFileSync('./templates/seed-content/' + e).toString())
		.map(e => {
			try {
				return JSON.parse(e);
			} catch (error) {
				return null;
			}
		});

		files.forEach((e:?ThreadTemplate) => {
			const id = uuid.v4();

			if (!e) return;
			changes.entities[id] = new Thread({
				id,
				type: TYPE_THREAD,
				name: template(e.title)({
					name: room.name
				}),
				body: template(e.body)({
					name: room.name
				}),
				parents: [ room.id ],
				creator: e.creator,
				createTime: Date.now(),
			});
		});

		bus.emit('change', changes);
	});
}

function getPlacesByType(geometry, type) {
	return places.getNearByPlaces(
		geometry.location.lat,
		geometry.location.lng,
		2000,
		type
	).then(results => {
		const detailsPromises = [];

		results.slice(0, 4).forEach(result => {
			detailsPromises.push(places.getPlaceDetails(result.place_id));
		});

		return Promise.all(detailsPromises)
		.then(detailedPlaces => {
			for (let i = 0; i < detailedPlaces.length; i++) {
				const place = detailedPlaces[i], details = {
						name: place.name,
						website: place.website,
						address: place.formatted_address,
						phone: place.formatted_phone_number
					};
				if (place.photos && place.photos.length) {
					detailedPlaces[i] = places.getPhotoFromReference(place.photos[0].photo_reference, 300)
					.then(photo => ({
						details,
						photo: {
							attributions: place.photos[0].html_attributions,
							url: photo.location,
							width: photo.width,
							height: photo.height
						}
					}));
				} else {
					detailedPlaces[i] = Promise.resolve({
						details,
						photo: null
					});
				}
			}

			return Promise.all(detailedPlaces).then(res => ({
				[type]: res
			}));
		});
	});
}

function seedGAPIContent(room) {
	const geometry = room.params.placeDetails.geometry;
	if (geometry) {

		const promises = types.map(type => {
			return getPlacesByType({
				location: {
					lat: 13.1315386,
					lng: 77.60205690000001
				}
			}, type);
		});

		return Promise.all(promises);
	} else {
		return Promise.resolve([]);
	}
}

seedGAPIContent({
	params: {
		placeDetails: {
			geometry: 1
		}
	}
}).then(results => {
	const group = {};
	results.forEach(e => {
		group[Object.keys(e)[0]] = e[Object.keys(e)[0]];
	});

	console.log('Final details:', group);
})

bus.on('postchange', (changes, next) => {
	const entities = changes && changes.entities || {};
	Object.keys(entities).filter(e => (
        entities[e].type === TYPE_ROOM && entities[e].createTime &&
        entities[e].createTime === entities[e].updateTime
	)).map(e => entities[e]).forEach((room) => {
		seedGAPIContent(room);
		seedContent(room);
	});
	next();
});

log.info('Content seeding module ready.');
