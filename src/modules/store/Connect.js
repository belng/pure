/* @flow */

import React, { Component } from 'react';
import shallowEqual from 'shallowequal';
import mapValues from 'lodash/mapValues';
import storeShape from './storeShape';

type Store = {
	subscribe(
		slice: { type: Function },
		range?: { start?: number, before?: number, after?: number },
		callback: Function
	): { remove: Function };
	[key: string]: Function;
}

type MapSubscriptionToProps = {
	[key: string]: string | {
		slice: string | { type: string };
		range?: { start?: number, before?: number, after?: number },
		transform?: Function;
	}
};

type MapSubscriptionToPropsCreator = (props: Object) => MapSubscriptionToProps;

type MapActionsToProps = {
	[key: string]: (props: Object, store: Store) => Function
};

export default function(
	mapSubscriptionToProps?: MapSubscriptionToProps|MapSubscriptionToPropsCreator,
	mapActionsToProps?: MapActionsToProps
): Function {
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

			componentDidMount() {
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
								{ type: sub },
								null,
								this._updateListener(item)
							);
							break;
						case 'object':
							listener = store.subscribe(
								typeof sub.slice === 'string' ? { type: sub.slice } : sub.slice,
								sub.range,
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
			}

			componentWillUnmount() {
				if (this._subscriptions) {
					for (let i = 0, l = this._subscriptions.length; i < l; i++) {
						this._subscriptions[i].remove();
					}

					this._subscriptions = [];
				}
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
					const action = value(this.props, this.context.store);

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
