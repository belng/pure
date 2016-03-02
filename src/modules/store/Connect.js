/* @flow */
/* eslint-disable react/sort-comp */

import React, { Component, PropTypes, Children } from 'react';
import shallowEqual from 'shallowequal';
import mapValues from 'lodash/mapValues';
import storeShape from './storeShape';

import type {
	Subscription,
	MapSubscriptionToProps,
	MapActionsToProps
} from './ConnectTypes';

type Props = {
	mapSubscriptionToProps?: MapSubscriptionToProps;
	mapActionsToProps?: MapActionsToProps;
	children?: Element;
}

export default class Connect extends Component<void, Props, any> {
	static contextTypes = {
		store: storeShape.isRequired,
	};

	static propTypes = {
		mapSubscriptionToProps: PropTypes.object,
		mapActionsToProps: PropTypes.object,
		children: PropTypes.element.isRequired
	};

	state: any = {};

	_subscriptions: Array<Subscription> = [];

	_addSubscriptions: Function = (props, context) => {
		const {
			store
		} = context;

		const {
			mapSubscriptionToProps
		} = props;

		if (typeof store !== 'object') {
			throw new Error('No store was found. Have you wrapped the root component in <StoreProvider /> ?');
		}

		if (mapSubscriptionToProps) {
			for (const item in mapSubscriptionToProps) {
				const sub = mapSubscriptionToProps[item];

				let listener;

				switch (typeof sub) {
				case 'string':
					listener = store.subscribe(
						{ type: sub },
						this._updateListener(item)
					);
					break;
				case 'object':
					listener = store.subscribe(
						typeof sub.key === 'string' ? { type: sub.key } : { ...sub.key },
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

	_removeSubscriptions: Function = () => {
		if (this._subscriptions) {
			for (let i = 0, l = this._subscriptions.length; i < l; i++) {
				this._subscriptions[i].remove();
			}

			this._subscriptions = [];
		}
	};

	_renewSubscriptions: Function = (props, context) => {
		this._removeSubscriptions();
		this._addSubscriptions(props, context);
	};

	_updateListener: Function = (name, transform) => {
		return data => {
			this.setState({
				[name]: transform ? transform(data) : data
			});
		};
	};

	_setInitialState: Function = () => {
		const {
			mapSubscriptionToProps
		} = this.props;

		const state = {};

		for (const item in mapSubscriptionToProps) {
			state[item] = null;
		}

		this.setState(state);
	};

	componentWillMount() {
		this._setInitialState();
	}

	componentDidMount() {
		this._addSubscriptions(this.props, this.context);
	}

	componentWillReceiveProps(nextProps: Props) {
		this._renewSubscriptions(nextProps, this.context);
	}

	componentWillUnmount() {
		this._removeSubscriptions();
	}

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	render(): React$Element<any> {
		const {
			store
		} = this.context;

		const {
			mapActionsToProps,
		} = this.props;

		const actions = mapActionsToProps ? mapValues(mapActionsToProps, (value, key) => {
			const action = value(store, this.state);

			if (typeof action !== 'function') {
				throw new Error(`Invalid action in ${key}. Action creators must return a curried action function.`);
			}

			return action;
		}) : null;

		return React.cloneElement(Children.only(this.props.children), { ...this.state, ...actions });
	}
}
