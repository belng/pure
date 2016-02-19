/* @flow */

export type Subscription = {
	remove: () => void
}

export type SubscriptionSlice = {
	type: string;
	order: string;
	filter?: Object;
}

export type SubscriptionRange = {
	start: ?number,
	before: ?number,
	after: ?number
}

export type Store = {
	subscribe(
		options: {
			what?: string;
			slice?: SubscriptionSlice;
			range?: SubscriptionRange;
			order?: string;
		},
		callback: Function
	): Subscription;
	onSubscribe(callback: Function): Subscription;
	onUnSubscribe(callback: Function): Subscription;
	setState(payload: Object): void;
}

export type MapSubscriptionToProps = {
	[key: string]: string | {
		key: string | {
			type?: string;
			slice?: SubscriptionSlice;
			range?: SubscriptionRange;
			order?: string;
		};
		transform?: Function;
	}
};

export type MapSubscriptionToPropsCreator = (props: Object) => MapSubscriptionToProps;

export type MapActionsToProps = {
	[key: string]: (props: Object, store: Store) => Function
};
