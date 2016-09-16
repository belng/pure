/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import shallowEqual from 'shallowequal';

import type {
	SubscriptionPropsMap,
	DispatchPropsMap,
} from './createContainerTypes';
import type {
	Action,
} from './storeTypeDefinitions';

type Dispatch = (action: Action) => void
type MapSubscriptionToProps = SubscriptionPropsMap | (props: any) => SubscriptionPropsMap
type MapDispatchToProps = (dispatch: Dispatch) => DispatchPropsMap

type State = {
	[key: string]: any;
}

export default function(mapSubscriptionToProps?: ?MapSubscriptionToProps, mapDispatchToProps?: ?MapDispatchToProps) {
	return function(ChildComponent: ReactClass<any>): ReactClass<any> {
		class Container extends Component<void, any, State> {
			static contextTypes = {
				store: PropTypes.object.isRequired,
			};

			state: State = {};

			componentWillMount() {
				const {
					store,
				} = this.context;

				if (mapDispatchToProps) {
					this._actions = mapDispatchToProps(store.dispatch.bind(store));
				}

				if (mapSubscriptionToProps) {
					switch (typeof mapSubscriptionToProps) {
					case 'function':
						this._mapSubscriptionToProps = mapSubscriptionToProps;
						this._currentSubscriptionPropsMap = mapSubscriptionToProps(this.props);
						break;
					case 'object':
						this._currentSubscriptionPropsMap = mapSubscriptionToProps;
						break;
					default:
						throw new Error(`Invalid "mapSubscriptionToProps" ${mapSubscriptionToProps}. It must be a function or an object`);
					}

					this._addSubscriptions(store, this._currentSubscriptionPropsMap);
				}
			}

			componentWillReceiveProps(nextProps: any) {
				if (!shallowEqual(this.props, nextProps) && typeof this._mapSubscriptionToProps === 'function') {
					const nextSubscriptionPropsMap = this._mapSubscriptionToProps(nextProps);

					this._currentSubscriptionPropsMap = nextSubscriptionPropsMap;
					this._renewSubscriptions(this.context.store, nextSubscriptionPropsMap);
				}
			}

			shouldComponentUpdate(nextProps: any, nextState: any): boolean {
				return shallowCompare(this, nextProps, nextState);
			}

			componentWillUnmount() {
				this._removeSubscriptions();
			}

			_currentSubscriptionPropsMap: ?SubscriptionPropsMap;
			_mapSubscriptionToProps: ?Function;
			_actions: ?{ [key: string]: Function };
			_subscriptions: Array<Subscription> = [];

			_addSubscriptions = (store, subscriptionPropsMap) => {
				if (typeof store !== 'object') {
					throw new Error('No store was found. Have you wrapped the root component in <StoreProvider /> ?');
				}

				if (subscriptionPropsMap) {
					for (const item in subscriptionPropsMap) {
						const sub = subscriptionPropsMap[item];
						const source = ChildComponent.displayName || ChildComponent.name;

						const listener = store.observe({ ...sub, source }).subscribe(
							this._createUpdateObserver(item),
						);

						this._subscriptions.push(listener);
					}
				}
			};

			_removeSubscriptions = () => {
				if (this._subscriptions) {
					for (let i = 0, l = this._subscriptions.length; i < l; i++) {
						this._subscriptions[i].unsubscribe();
					}

					this._subscriptions = [];
				}
			};

			_renewSubscriptions = (store, subscriptionPropsMap) => {
				this._removeSubscriptions();
				this._addSubscriptions(store, subscriptionPropsMap);
			};

			_createUpdateObserver = (name) => {
				const next = data => {
					this.setState({
						[name]: data,
					});
				};

				return { next };
			};

			render() {
				const { state } = this;
				const currentSubscriptionPropsMap = this._currentSubscriptionPropsMap;

				if (state && currentSubscriptionPropsMap) {
					const stateKeys = Object.keys(state);

					for (const key in currentSubscriptionPropsMap) {
						if (stateKeys.indexOf(key) === -1) {
							return null;
						}
					}
				}

				return (
					<ChildComponent
						{...this.props}
						{...this.state}
						{...this._actions}
					/>
				);
			}
		}

		Container.displayName = `Container$${ChildComponent.displayName || ChildComponent.name}`;

		return Container;
	};
}
