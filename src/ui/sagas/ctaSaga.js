/* @flow */

import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';
import { config } from '../../core-client';

const {
	server: {
		host,
		protocol,
	},
} = config;


export default function *ctaSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('INITIALIZE_STATE', () => {
		const types = [ 'home', 'room' ];

		types.forEach(async type => {
			try {
				const res = await fetch(`${protocol}//${host}/s/cta_${type}.json`);
				const data = await res.json();

				put({
					type: 'SET_STATE',
					payload: {
						['cta' + type]: data,
					},
				});
			} catch (e) {
				// ignore
			}
		});
	});
}
