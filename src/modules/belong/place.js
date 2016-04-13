/* @flow */

import { config } from '../../core-server';
import request from 'request';
import winston from 'winston';
import * as constants from '../../lib/Constants';

const PLACE_TYPE_RE = /.*(locality).*/g;

function handleError(message, reject) {
	winston.error(message);
	reject(new Error(message));
	return;
}

function callApi(api, params) {
	return new Promise((resolve, reject) => {
		request(
			'https://maps.googleapis.com/maps/api/' + api +
			'/json?key=' + config.google.api_key + '&' +

			/* $FlowFixMe : We don't need all keys to be present */
			Object.keys(params).map(name => name + '=' + params[name])
			.join('&'),
			(error, response, body) => {
				if (error) {
					return handleError(
						'GAPI ' + api + ' HTTP ERROR: ' + error.message, reject
					);
				}

				let res;

				try { res = JSON.parse(body); } catch (e) {
					return handleError('GAPI ' + api + ' PARSE ERROR: ' + e.message, reject);
				}

				if (res.status !== 'OK') {
					return handleError('GAPI ' + api + ' STATUS: ' + res.status, reject);
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
			constants.TAG_ROOM_CITY : constants.TAG_ROOM_AREA,
	};
}

export function getStubset(placeid: string, rel: number): Promise<Object> {
	let spot;

	return callApi('place/details', { placeid })
	.then(place => {
		spot = place;

		return callApi('geocode', {
			latlng: place.geometry.location.lat +
				',' + place.geometry.location.lng,
		});
	})
	.then(results => {
		let areas = results.filter(place =>
			place.types.filter(type =>
				PLACE_TYPE_RE.test(type)
			).length > 0
		), index = 0;

		for (;index < areas.length; index++) {
			if (areas[index].place_id === spot.place_id) break;
		}

		areas = areas.slice(index, areas.length);

		return { rel, stubs: areas.map(placeToStub) };
	});
}
