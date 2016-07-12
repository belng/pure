/* @flow */

export type EventSubscription = {
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
	id: string;
	defer: boolean;
	source: string;
} | {
	slice: SubscriptionSlice;
	range: SubscriptionRange;
	defer: boolean;
	source: string;
}
