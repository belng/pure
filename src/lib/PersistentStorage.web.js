/* @flow */

export default class PersistentStorage {
	_id: string;

	constructor(id: string) {
		this._id = id;
	}

	setItem(key: string, data: any): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				localStorage.setItem(this._getKeyWithPrefix(key), JSON.stringify(data));
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	getItem(key: string): Promise<any> {
		return new Promise((resolve, reject) => {
			try {
				const data = localStorage.getItem(this._getKeyWithPrefix(key));

				if (typeof data === 'string') {
					resolve(JSON.parse(data));
				} else {
					resolve(null);
				}
			} catch (e) {
				reject(e);
			}
		});
	}

	removeItem(key: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				localStorage.removeItem(this._getKeyWithPrefix(key));
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	_getKeyWithPrefix(key: string): string {
		return `persistent_storage:${this._id}:${key}`;
	}
}
