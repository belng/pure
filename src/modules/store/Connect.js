/* @flow */

import React, { Component } from "react";
import shallowEqual from "shallowequal";
import storeShape from "./storeShape";

export default function(mapSubscriptionToProps: Object, mapDispatchToProps: Object): Function {
	if (process.env.NODE_ENV !== "production") {
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

				if (typeof store !== "object") {
					throw new Error("No store was found in the context. Have you wrapped the root component in <StoreProvider /> ?");
				}

				if (mapSubscriptionToProps) {
					this._watches = [];

					for (const sub in mapSubscriptionToProps) {
						this._watches.push(
							store.watch(mapSubscriptionToProps[sub], this._updateListener(sub))
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
					for (const dispatch in mapDispatchToProps) {
						props[dispatch] = mapDispatchToProps[dispatch](this.context.store);
					}
				}

				return <Target {...props} />;
			}
		};
	};
}
