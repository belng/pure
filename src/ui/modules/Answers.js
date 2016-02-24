/* @flow */

export default class Answers {
	static logCustom: (eventName: string, attributes: Object) => void;
	static logPurchase: (
		itemPrice: number, currency: string,
		itemName: string, itemType: string, itemId: string,
		purchaseSucceeded: boolean
	) => void;
	static logAddToCart: (
		itemPrice: number, currency: string,
		itemName: string, itemType: string, itemId: string
	) => void;
	static logStartCheckout: (totalPrice: number, currency: string, itemCount: number) => void;
	static logContentView: (contentName: string, contentType: string, contentId: string) => void;
	static logSearch: (query: string) => void;
	static logShare: (contentName: string, contentType: string, contentId: string) => void;
	static logRating: (rating: number, contentName: string, contentType: string, contentId: string) => void;
	static logSignup: (signupMethod: string, signupSucceeded: boolean) => void;
	static logLogin: (loginMethod: string, loginSucceeded: boolean) => void;
	static logInvite: (inviteMethod: string) => void;
	static logLevelStart: (levelName: string) => void;
	static logLevelEnd: (levelName: string, score: number, success: boolean) => void;
}
