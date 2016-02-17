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
	start?: number,
	before?: number,
	after?: number
}

export type Store = {
	subscribe(
		options: {
			what?: string;
			slice?: SubscriptionSlice;
			range?: SubscriptionRange;
		},
		callback: Function
	): Subscription;
	[key: string]: Function;
}

export type MapSubscriptionToProps = {
	[key: string]: string | {
		key: string | {
			type?: string;
			slice?: SubscriptionSlice;
			range?: SubscriptionRange;
		};
		transform?: Function;
	}
};

export type MapSubscriptionToPropsCreator = (props: Object) => MapSubscriptionToProps;

export type MapActionsToProps = {
	[key: string]: (props: Object, store: Store) => Function
};
