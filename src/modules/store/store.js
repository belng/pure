import { bus, cache } from '../../core-client';

cache.subscribe = (opts, callback) => {
	const unwatch = (() => { // probably too many functions wrapped.
		switch (opts.what) {
		case 'entity':
			return this.watchEntity(opts.id, callback);
		case 'texts':
		case 'threads':
			return this.watch(opts.slice, opts.range, callback);
		case 'app':
			return this.watchApp(opts.path, callback);
		default:
			return this[opts.what](opts, callback);
		}
	})();

	for (const watch of this._subscriptionWatchs) {
		watch(opts);
	}

	return () => {
		for (const watch of this._unsubscriptionWatchs) {
			watch(opts);
		}
		unwatch();
	};
};

cache.me = (opts, callback) => {
	const user = cache.getApp([ 'user' ]);
	let unwatchApp, unwatchMe;

	function fire(id) {
		if (unwatchMe) unwatchMe();
		unwatchMe = cache.watchEntity(id, (entity) => {
			callback(entity);
		});
	}

	fire(user);
	unwatchApp = cache.watchApp([ 'user' ], fire);

	return function() {
		unwatchApp();
		unwatchMe();
	};
};

cache.onSubscribe = (fn) => {
	this._subscriptionWatchs.push(fn);
	return () => {
		const index = this._subscriptionWatchs.indexOf(fn);

		if (index > -1) this._subscriptionWatchs.splice(index, 1);
	};
};


cache.onUnsubscribe = (fn) => {
	this._unsubscriptionWatchs.push(fn);
	return () => {
		const index = this._unsubscriptionWatchs.indexOf(fn);

		if (index > -1) this._unsubscriptionWatchs.splice(index, 1);
	};
};

cache._subscriptionWatchs = [];
cache._unsubscriptionWatchs = [];

cache.setState = (payload: Object): void => bus.emit('setstate', payload);

export default cache;
