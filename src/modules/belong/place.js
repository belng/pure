import { config } from '../../core-server';
import request from 'request';
import winston from 'winston';
import * as constants from '../../lib/Constants';

const PLACE_TYPE_RE = /.*(locality|administrative_area).*/g;

function callApi(api, params) {
	return new Promise((resolve, reject) => {
		request(
			'https://maps.googleapis.com/maps/api/' + api +
			'/json?key=' + config.google.api_key + '&' +
			Object.keys(params).map(name => name + '=' + params[name])
			.join('&'),
			(error, response, body) => {
				if (error) {
					winston.error(error);
					return reject(error);
				}

				let res;

				try { res = JSON.parse(body); } catch (e) {
					winston.error(e);
					return reject(e);
				}

				if (res.status !== 'OK') {
					winston.error('Result Status' + res.status);
					return reject(res.status);
				}

				return resolve(res.results || res.result);
			}
		);
	});
}

function placeToStub(place) {
	return {
		identity: 'place:' + place.place_id,
		name: place.address_components[0].long_name,
		type: place.types[0] === 'locality' ?
			constants.TAG_ROOM_CITY : constants.TAG_ROOM_AREA
	};
}

export function getStubset(placeid) {
	let spot;

	return callApi('place/details', { placeid })
	.then(place => {
		spot = place;
		return callApi('geocode', {
			latlng: place.geometry.location.lat +
				',' + place.geometry.location.lng
		});
	})
	.then(results => {
		const areas = results.filter(place =>
			PLACE_TYPE_RE.test(place.types[0]));

		if (areas[0].place_id !== spot.place_id) { areas.unshift(spot); }

		return areas.map(placeToStub);
	});
}
