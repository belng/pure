/* @flow */

import type { User } from '../../lib/schemaTypes';
import UserModel from '../../models/user';
import ThreadModel from '../../models/thread';
import uuid from 'uuid';
import { PRESENCE_FOREGROUND, PRESENCE_BACKGROUND } from '../../lib/Constants';

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
		signup: new UserModel(user)
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
		[user.id]: new UserModel(user)
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
			}
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
			}
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
export const sendText = (): Object => ({

});

export const startThread = (data: { name: string; body: string; meta?: ?Object; parents: Array<string>; creator: string; }): Object => {
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
			presence: status === 'online' ? PRESENCE_FOREGROUND : PRESENCE_BACKGROUND
		})
	}
});
