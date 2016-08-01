/* @flow */

export type State = any

export type Action = {
	type: string;
	payload?: any;
}

export type Reducer<S, A> = (state: S, action: A) => S // eslint-disable-line no-undef

export type ActionCreator = (...args: any) => Action

export type Dispatch = (action: Action) => any

export type MiddlewareAPI = {
	dispatch: Dispatch;
	getState: () => State;
}

export type Middleware = (api: MiddlewareAPI) => (next: Dispatch) => Dispatch

export type QueryGetter = (path: string, options: any) => any;

export type QueryObserver = (path: string, options: any) => Observable<any>;

export type QueryProviderAPI = {
	get: QueryGetter;
	observe: QueryObserver;
}

export type QueryProvider = (api: QueryProviderAPI) => QueryProviderAPI;

export type Store = {
  dispatch: Dispatch;
  getState: () => State;
  replaceReducer: (reducer: Reducer) => void;
  addMiddleware: (middleware: Middleware) => void;
  addQueryProvider: (provider: QueryProvider) => void;
  get: QueryGetter;
  observe: QueryObserver;
}

export type StoreCreator = (reducer: Reducer, preloadedState: ?State) => Store

export type StoreEnhancer = (next: StoreCreator) => StoreCreator
