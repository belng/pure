/* @flow */

type Account = {
	id: ?string;
	token: ?string;
	display_name: ?string;
	email: ?string;
	token: ?string;
	auth_code: ?string;
	photo_url?: string;
}

export default class Facebook {
	static signIn: () => Promise<Account>;
	static signOut: () => Promise<boolean>;
	static revokeAccess: () => Promise<boolean>;
}
