/* @flow */

export type Action = {
	type: string;
	payload?: any;
}

export type StoreAdapater = {
	get?: (type: string, options: any) => ?Promise<any>;
	getCurrent?: (type: string, options: any) => any;
	subscribe?: (type: string, options: any, callback: Function) => ?Function;
	dispatch?: (action: Action) => void;
}

export type Store = {
	get: (type: string, options: any) => Promise<any>;
	getCurrent: (type: string, options: any) => any;
	observe: (type: string, options: any) => Observable<any>;
	dispatch: (action: Action) => void;
}
