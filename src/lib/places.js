import { config } from '../core-server';
import request from 'request';
import winston from 'winston';


function handleError(message, reject) {
	winston.error(message);
	reject(new Error(message));
	return;
}

export function callApi(api: string, params: Object) {
	return new Promise((resolve, reject) => {
		const p = 'https://maps.googleapis.com/maps/api/' + api +
		'/json?key=' + config.google.api_key + '&' +

		Object.keys(params).map(name => name + '=' + params[name])
		.join('&');
		console.log("REQUEST:", p);
		request(
			p,
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

export function getNearByPlaces(lat: number, long: number, radius: number, type: string) {
	return callApi('place/nearbysearch', {
		location: lat + ',' + long,
		radius,
		type
	});
}
//
// getNearByPlaces(-33.8670522, 151.1957362, 1000).then((res) => {
// 	console.log(res.map(e=>e.geometry));
// }).catch((e) => {
// 	console.log(e);
// });
