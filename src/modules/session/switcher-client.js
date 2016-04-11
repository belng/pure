/* @flow */

import { subscribe, dispatch } from '../store/store';
import { config } from '../../core-client';
import PersistentStorage from '../../lib/PersistentStorage';

const sessionListStorage = new PersistentStorage('sessionList');

const {
	server: {
		host,
		protocol,
	}
} = config;


function saveList(list) {
	dispatch({ state: { sessionList: list } });
}

function removeList() {
	dispatch({ state: { sessionList: null } });
}


/*
 * When the user changes, we look for a sessions_list in their params
 * If it exists, we fetch the new list from the URL
 * If it doesn't exist, we check if the user id exists in the current list
 * If it doesn't exist in the current list, clear the current list
 */

subscribe({ type: 'me', source: 'sessionswitcher' }, async user => {
	if (!user) {
		return;
	}

	if (user.params && user.params.sessions_list) {
		const res = await fetch(`${protocol}//${host}/${user.params.sessions_list}`);
		const list = await res.json();

		sessionListStorage.setItem('list', list);
		saveList(list);
	} else {
		const list = await sessionListStorage.getItem('list');

		if (list) {
			let exists;

			for (let i = 0, l = list.length; i < l; i++) {
				if (list[i] && list[i].user === user.id) {
					exists = true;
					break;
				}
			}

			if (exists) {
				saveList(list);
			} else {
				removeList();
			}
		} else {
			removeList();
		}
	}
 });
