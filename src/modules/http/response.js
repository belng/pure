import route from 'koa-route';
import handlebars from 'handlebars';
import { config, bus, cache } from '../../core-server';
import fs from 'fs';

const template = handlebars.compile(fs.readFileSync(__dirname + '/web.hbs', 'utf-8').toString());
function getEntity(id) {
    return new Promise((resolve, reject) => {
        cache.getEntity(id, (err, entity) => {
            if(err) reject(err);
            else resolve(entity);
        });
    });
}

bus.on('http/init', app => {
    app.use(route.get('/*', function *() {
        const path = this.request.url.split("/").filter(e => e);
        const renderOptions = {
            link: config.playstoreLink,
        };
        if (!path[0] || path[0].length < 3) return;
        try {
			const primaryEntity = yield getEntity(path[0]);
            if(primaryEntity) {
                renderOptions.room = primaryEntity.name;
            } else {
                renderOptions.room = 'A room'
            }
            if (path.length > 1) {
                const secondaryEntity = yield getEntity(path[1]);
                if(secondaryEntity) {
                    renderOptions.thread = secondaryEntity.name;
                } else {
                    renderOptions.thread = 'A thread on belong';
                }
            }
            this.body = template(renderOptions);
		} catch (e) {
			this.throw(500, e.message);
		}
	}));
});
