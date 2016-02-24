/* @flow */

type AccessToken = {
	accountName: ?string;
	token: ?string;
	cache?: boolean;
}

export default class Facebook {
	static logIn: () => Promise<AccessToken>;
	static logOut: () => Promise<boolean>;
}
