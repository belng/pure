/* @flow */

import type { User } from '../../lib/schemaTypes';

/*
 * User related actions
 */
export const signIn = (gateway: string, accessToken: string): Object => ({
	auth: {
		[gateway]: {
			token: accessToken
		}
	}
});

export const signOut = (): Object => ({

});

export const saveUser = (user: User): Object => ({
	entities: {
		[user.id]: user,
		__op__: {
			[user.id]: 'replace'
		}
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
