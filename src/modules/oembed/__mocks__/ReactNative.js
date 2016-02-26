const data = {};

const AsyncStorage = {
	setItem(key, value) {
		data[key] = value;

		return Promise.resolve();
	},

	getItem(key) {
		return Promise.resolve(data[key]);
	},

	removeItem(key) {
		delete data[key];

		return Promise.resolve();
	}
};

export default { AsyncStorage };
