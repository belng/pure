/* @flow */

import type { User } from '../../lib/schemaTypes';
import UserModel from '../../models/user';
import ThreadModel from '../../models/thread';
import TextModel from '../../models/text';
import RoomRelModel from '../../models/roomrel';
import ThreadRelModel from '../../models/threadrel';
import uuid from 'uuid';
import { PRESENCE_FOREGROUND } from '../../lib/Constants';

/*
 * User related actions
 */
export const signIn = (provider: string, accessToken: string): Object => ({
	auth: {
		[provider]: {
			accessToken
		}
	}
});

export const signUp = (user: User): Object => ({
	auth: {
		signup: new UserModel({ ...user, presence: PRESENCE_FOREGROUND })
	}
});

export const cancelSignUp = (): Object => ({
	state: {
		signup: null
	}
});

export const signOut = (): Object => ({

});

export const saveUser = (user: User): Object => ({
	entities: {
		[user.id]: new UserModel({ ...user, presence: PRESENCE_FOREGROUND })
	}
});

export const addPlace = (user: string, type: string, place: Object): Object => ({
	entities: {
		[user]: new UserModel({
			id: user,
			params: {
				places: {
					[type]: place
				}
			},
			presence: PRESENCE_FOREGROUND
		})
	}
});

export const removePlace = (user: string, type: string): Object => ({
	entities: {
		[user]: new UserModel({
			id: user,
			params: {
				places: {
					__op__: {
						[type]: 'delete'
					}
				}
			},
			presence: PRESENCE_FOREGROUND
		})
	}
});

export const banUser = (): Object => ({

});

export const unbanUser = (): Object => ({

});


/*
 * Text related actions
 */
export const sendMessage = (
	data: { body: string; meta?: ?Object; parents: Array<string>; creator: string; }
): Object => {
	const id = uuid.v4();

	return {
		entities: {
			[id]: new TextModel({ id, ...data, create: true })
		}
	};
};

export const startThread = (
	data: { name: string; body: string; meta?: ?Object; parents: Array<string>; creator: string; }
): Object => {
	const id = uuid.v4();

	return {
		entities: {
			[id]: new ThreadModel({ id, ...data, create: true })
		}
	};
};

export const hideText = (): Object => ({

});

export const unhideText = (): Object => ({

});

export const uploadImage = (): Object => ({

});

/*
 * Notification related actions
 */
export const dismissAllNotes = (): Object => ({

});

export const dismissNote = (): Object => ({

});

/*
 * Presence related actions
 */

export const setPresence = (id: string, status: 'online' | 'offline'): Object => ({
	entities: {
		[id]: new UserModel({
			id,
			presence: status === 'online' ? PRESENCE_FOREGROUND : 'none'
		})
	}
});


export const setItemPresence = (
	type: string, item: string, user: string, status: 'online' | 'offline', create: boolean
): Object => {
	const rel = {
		item,
		user,
		create,
		presence: status === 'online' ? PRESENCE_FOREGROUND : 'none'
	};

	switch (type) {
	case 'room':
		return {
			entities: {
				[`${user}_${item}`]: new RoomRelModel(rel)
			}
		};
	case 'thread':
		return {
			entities: {
				[`${user}_${item}`]: new ThreadRelModel(rel)
			}
		};
	}

	return {};
};
