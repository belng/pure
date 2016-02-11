/* @flow */

import React, { Component } from 'react';
import shallowEqual from 'shallowequal';
import storeShape from './storeShape';

export default function(mapSubscriptionToProps: ?Object, mapActionsToProps: ?Object): Function {
	if (process.env.NODE_ENV !== 'production') {
		if (mapSubscriptionToProps && mapActionsToProps) {
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
		return class Connect extends Component {
			static contextTypes = {
				store: storeShape.isRequired
			};

			state = {};

			_watches: Array<Function> = [];

			componentDidMount() {
				const { store } = this.context;

				if (typeof store !== 'object') {
					throw new Error('No store was found in the context. Have you wrapped the root component in <StoreProvider /> ?');
				}

				if (mapSubscriptionToProps) {
					for (const item in mapSubscriptionToProps) {
						const sub = mapSubscriptionToProps[item];

						if (!Array.isArray(sub)) {
							throw new Error(`Invalid subscription ${item}. Subscription must be an array with the key to watch, options, and helper function.`);
						}

						this._watches.push(
							store.watch(sub[0], sub[1], this._updateListener(item, sub[2]))
						);
					}
				}
			}

			componentWillUnmount() {
				if (this._watches) {
					for (let i = 0, l = this._watches.length; i < l; i++) {
						this._watches[i].clear();
					}

					this._watches = [];
				}
			}

			shouldComponentUpdate(nextProps, nextState) {
				return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
			}

			_updateListener = (name, helper) => {
				return data => this.setState({
					[name]: helper ? helper(data) : data
				});
			};

			render() {
				const props = { ...this.state };

				if (mapActionsToProps) {
					for (const item in mapActionsToProps) {
						const action = mapActionsToProps[item](this.context.store);

						if (typeof action !== 'function') {
							throw new Error(`Invalid action in ${item}. Action creators must return a curried action function.`);
						}

						props[item] = action;
					}
				}

				return <Target {...props} />;
			}
		};
	};
}
