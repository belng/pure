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
	start: number;
	before?: number;
	after?: number;
	end?: number;
}

export type SubscriptionOptions = {
	type?: string;
	slice?: SubscriptionSlice;
	range?: SubscriptionRange;
	order?: string;
	id?: string;
	path?: string;
	source: string;
	defer?: ?boolean;
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

export type MapActionsToProps = {
	[key: string]: (store: Store, result: any, props: any) => Function
};
