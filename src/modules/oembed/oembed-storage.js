/* @flow */

import React from 'react-native';

const {
	AsyncStorage
} = React;

let data;

export default {
	async _readData(): any {
		const dataString = await AsyncStorage.getItem('oembed_storage');

		if (dataString) {
			data = JSON.parse(dataString);
		} else {
			data = [];
		}
	},

	_findItem(key: string): ?string {
		for (let i = 0, l = data.length; i < l; i++) {
			if (data[i] && data[i].url === key) {
				return data[i].json;
			}
		}

		return null;
	},

	async set(url: string, json: string): Promise {
		const item = await this.get(url);

		if (item) {
			item.json = json;
		} else {
			data.push({
				url,
				json
			});
		}

		if (data.length >= 100) {
			data.splice(0, 10);
		}

		return AsyncStorage.setItem('oembed_storage', JSON.stringify(data));
	},

	async get(url: string): Promise<string> {
		if (!data) {
			await this._readData();
		}

		return this._findItem(url);
	}

};
