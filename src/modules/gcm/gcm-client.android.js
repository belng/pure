/* @flow */

import store from '../store/store';
import GCM from '../../ui/modules/GCM';
import Colors from '../../ui/Colors';

GCM.cancelCurrentNotifications();
GCM.markCurrentNotificationsAsRead();
GCM.configureSchema({
	event: 'number',
	count: 'number',
	data: {
		body: 'string',
		link: 'string',
		picture: 'string',
		title: 'string',
	},
	createTime: 'number',
	group: 'string',
});
GCM.configureNotification({
	style: 'bigtext',
	sticky: false,
	slient: true,
	priority: 'normal',
	category: 'social',
	color: Colors.primary,
	count: false,
	template: {
		title: '{{items.0.data.title}}',
		body: '<b>{{items.0.data.creator}}</b>: {{items.0.data.body}}',
		picture: '{{{items.0.data.picture}}}',
		link: '{{{items.0.data.link}}}',
	},
});

store.observe({ type: 'state', path: 'session', source: 'gcm' }).forEach(session => {
	if (session === '@@loading') {
		return;
	}

	GCM.setSessionID(session || '');
});
