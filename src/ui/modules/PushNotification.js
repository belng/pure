/* @flow */

type RegistrationDetails = {
	registrationId: string;
	uuid: string;
	deviceModel: string;
}

export default class PushNotification {
	static setGCMSenderID: (id: string) => void;
	static registerGCM: () => Promise<RegistrationDetails>;
	static unRegisterGCM: () => Promise<string>;
	static setPreference: (key: string, value: string) => void;
	static getPreference: (key: string) => Promise<string>;
}
