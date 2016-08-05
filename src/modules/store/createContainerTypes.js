/* @flow */

export type SubscriptionPropsMap = {
	[key: string]: {
		type: string;
		defer?: boolean;
	}
};

export type DispatchPropsMap = {
	[key: string]: (...args: any) => any;
};
