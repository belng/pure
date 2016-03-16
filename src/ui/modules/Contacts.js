/* @flow */

type Contact = {
	id: string;
	name?: string;
	number?: string;
	email?: string;
	address?: {
		street?: string;
		city?: string;
		country?: string;
		region?: string;
		neighborhood?: string;
		postcode?: string;
		pobox?: string;
	};
	photo?: string;
	thumbnail?: string;
}

export default class Contacts {
	static getContacts: () => Promise<Array<Contact>>;
}
