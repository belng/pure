/* @flow */

import route from 'koa-route';
import { bus, cache } from '../../core-server';
import buildAvatarURLForSize from './buildAvatarURLForSize';

bus.on('http/init', app => {
	app.use(route.get('/i/picture', function *() {
		const query = this.request.query;

		if (query && query.user) {
			const {
				user,
				size
			} = query;

			const data = yield new Promise((resolve, reject) => {
				cache.getEntity(user, (err, res) => {
					if (err) {
						reject(err);
					} else {
						resolve(res);
					}
				});
			});

			if (data && data.meta && data.meta.picture) {
				this.response.redirect(buildAvatarURLForSize(data.meta.picture, size));
			} else {
				this.throw(404, `Couldn't find picture for user: ${user}`);
			}
		} else {
			this.throw(400, 'User ID is not specified for picture');
		}
	}));
});
