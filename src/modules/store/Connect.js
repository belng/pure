/* @flow */

import React, { Component } from 'react';
import shallowEqual from 'shallowequal';
import storeShape from './storeShape';

export default function(mapSubscriptionToProps: Object, mapDispatchToProps: Object): Function {
	if (process.env.NODE_ENV !== 'production') {
		if (mapSubscriptionToProps && mapDispatchToProps) {
			for (const key in mapSubscriptionToProps) {
				if (mapDispatchToProps[key]) {
					throw new Error(`Prop ${key} found both in subscriptions and dispatch. Props must be unique.`);
				}
			}

			for (const key in mapDispatchToProps) {
				if (mapSubscriptionToProps[key]) {
					throw new Error(`Prop ${key} found both in subscriptions and dispatch. Props must be unique.`);
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

			_watches: ?Array<Function>;

			componentDidMount() {
				const { store } = this.context;

				if (typeof store !== 'object') {
					throw new Error('No store was found in the context. Have you wrapped the root component in <StoreProvider /> ?');
				}

				if (mapSubscriptionToProps) {
					this._watches = [];

					for (const item in mapSubscriptionToProps) {
						const sub = mapSubscriptionToProps[item];

						if (!Array.isArray(sub)) {
							throw new Error(`Invalid subscription ${item}. Subscription must be an array with first item being the key to watch, and second item as options.`);
						}

						this._watches.push(
							store.watch(sub[0], sub[1], this._updateListener(item))
						);
					}
				}
			}

			componentWillUnmount() {
				if (this._watches) {
					for (let i = 0, l = this._watches.length; i < l; i++) {
						this._watches[i].clear();
					}

					delete this._watches;
				}
			}

			shouldComponentUpdate(nextProps, nextState) {
				return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
			}

			_updateListener = name => {
				return data => this.setState({
					[name]: data
				});
			};

			render() {
				const props = { ...this.state };

				if (mapDispatchToProps) {
					for (const item in mapDispatchToProps) {
						const dispatch = mapDispatchToProps[item](this.context.store);

						if (typeof dispatch !== 'function') {
							throw new Error(`Invalid dispatch function in ${item}. Action creators must return a curried dispatch function.`);
						}

						props[item] = dispatch;
					}
				}

				return <Target {...props} />;
			}
		};
	};
}
