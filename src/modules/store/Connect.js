/* @flow */

import React, { Component } from 'react';
import shallowEqual from 'shallowequal';
import mapValues from 'lodash/mapValues';
import storeShape from './storeShape';

type Subscription = {
	remove: () => void
}

type SubscriptionSlice = {
	type: string;
	order: string;
	filter?: Object;
}

type SubscriptionRange = {
	start?: number,
	before?: number,
	after?: number
}

type Store = {
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

type MapSubscriptionToProps = {
	[key: string]: string | {
		key: string | {
			type?: string;
			slice?: SubscriptionSlice;
			range?: SubscriptionRange;
		};
		transform?: Function;
	}
};

type MapSubscriptionToPropsCreator = (props: Object) => MapSubscriptionToProps;

type MapActionsToProps = {
	[key: string]: (props: Object, store: Store) => Function
};

export default function(
	mapSubscriptionToProps: ?MapSubscriptionToProps|MapSubscriptionToPropsCreator,
	mapActionsToProps: ?MapActionsToProps
): (Target: ReactClass) => ReactClass {
	if (process.env.NODE_ENV !== 'production') {
		if (
			typeof mapSubscriptionToProps === 'object' &&
			typeof mapActionsToProps === 'object' &&
			mapSubscriptionToProps && mapActionsToProps
		) {
			for (const key in mapSubscriptionToProps) {
				if (mapActionsToProps[key]) {
					throw new Error(`Prop ${key} found both in subscriptions and actions. Props must be unique.`);
				}
			}

			for (const key in mapActionsToProps) {
				if (mapSubscriptionToProps[key]) {
					throw new Error(`Prop ${key} found both in subscriptions and actions. Props must be unique.`);
				}
			}
		}
	}

	return function(Target: ReactClass): ReactClass {
		return class Connect extends Component<{}, {}, { store: Store }> {
			static contextTypes = {
				store: storeShape.isRequired
			};

			state = {};

			_subscriptions: Array<Function> = [];

			_addSubscriptions = () => {
				const { store } = this.context;

				if (typeof store !== 'object') {
					throw new Error('No store was found in the context. Have you wrapped the root component in <StoreProvider /> ?');
				}

				if (mapSubscriptionToProps) {
					let subscriptions;

					if (typeof mapSubscriptionToProps === 'function') {
						subscriptions = mapSubscriptionToProps(this.props);
					} else if (typeof mapSubscriptionToProps === 'object') {
						subscriptions = mapSubscriptionToProps;
					}

					for (const item in subscriptions) {
						const sub = subscriptions[item];

						let listener;

						switch (typeof sub) {
						case 'string':
							listener = store.subscribe(
								{ what: sub },
								this._updateListener(item)
							);
							break;
						case 'object':
							listener = store.subscribe(
								typeof sub.key === 'string' ? { what: sub.key } : { ...sub.key, what: sub.key.type, type: null },
								this._updateListener(item, sub.transform)
							);
							break;
						default:
							throw new Error(`Invalid subscription ${item}. Subscription must be a string or an object.`);
						}

						if (listener) {
							this._subscriptions.push(listener);
						}
					}
				}
			};

			_removeSubscriptions = () => {
				if (this._subscriptions) {
					for (let i = 0, l = this._subscriptions.length; i < l; i++) {
						this._subscriptions[i].remove();
					}

					this._subscriptions = [];
				}
			};

			_renewSubscriptions = () => {
				this._removeSubscriptions();
				this._addSubscriptions();
			};

			componentDidMount() {
				this._addSubscriptions();
			}

			componentDidUpdate(prevProps) {
				if (typeof mapSubscriptionToProps !== 'function') {
					return;
				}

				if (shallowEqual(prevProps, this.props)) {
					return;
				}

				this._renewSubscriptions();
			}

			componentWillUnmount() {
				this._removeSubscriptions();
			}

			shouldComponentUpdate(nextProps, nextState) {
				return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
			}

			_updateListener = (name, transform) => {
				return data => this.setState({
					[name]: transform ? transform(data) : data
				});
			};

			render() {
				const props = { ...this.props, ...this.state };
				const actions = mapActionsToProps ? mapValues(mapActionsToProps, (value, key) => {
					const action = value(props, this.context.store);

					if (typeof action !== 'function') {
						throw new Error(`Invalid action in ${key}. Action creators must return a curried action function.`);
					}

					return action;
				}) : null;

				return <Target {...props} {...actions} />;
			}
		};
	};
}
