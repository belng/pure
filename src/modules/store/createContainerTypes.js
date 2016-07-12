/* @flow */

import type {
	SubscriptionSlice,
	SubscriptionRange,
} from './subscriptionTypeDefinitions';

export type SubscriptionPropsMap = {
	[key: string]: {
		type: string;
		options?: {
			id: string;
			defer?: boolean;
		} | {
			slice: SubscriptionSlice;
			range: SubscriptionRange;
			order: string;
			defer?: boolean;
		}
	}
};

export type DispatchPropsMap = {
	[key: string]: (...args: any) => any;
};
