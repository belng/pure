/* @flow */

export default class GCM {
	static getRegistrationToken: () => Promise<string>;
	static setPreference: (key: string, value: string) => void;
	static getPreference: (key: string) => Promise<string>;
}
