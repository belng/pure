import route from 'koa-route';
import handlebars from 'handlebars';
import { config, bus } from '../../core-server';
import fs from 'fs';

const template = handlebars.compile(fs.readFileSync(__dirname + '/web.hbs', 'utf-8').toString());

bus.on('http/init', app => {
    app.use(route.get('/*', function *() {
        const path = this.request.url.split("/").filter(e => e);
        if (path[0] && path[0].length < 3) return;
        this.body = template({
            link: config.playstoreLink
        });
	}));
});
