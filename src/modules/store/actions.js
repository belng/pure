/* @flow */

import type { User } from '../../lib/schemaTypes';
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
		signup: user
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
		[user.id]: user
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

export const startThread = (): Object => ({

});

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
		[id]: {
			presence: status === 'online' ? PRESENCE_FOREGROUND : PRESENCE_BACKGROUND
		}
	}
});
