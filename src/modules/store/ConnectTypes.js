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

export type SubscriptionOptions = {
	what?: string;
	slice?: SubscriptionSlice;
	range?: SubscriptionRange;
	order?: string;
	id?: string;
	path?: string|Array<string>
}

export type Store = {
	subscribe(
		options: SubscriptionOptions,
		callback: Function
	): Subscription;
	on(event: string, callback: Function): Subscription;
	off(event: string, callback: Function): void;
	dispatch(payload: Object): void;
}

export type MapSubscriptionToProps = {
	[key: string]: string | {
		key: string | { type?: string; };
		transform?: Function;
	}
};

export type MapSubscriptionToPropsCreator = (props: Object) => MapSubscriptionToProps;

export type MapActionsToProps = {
	[key: string]: (props: Object, store: Store) => Function
};
