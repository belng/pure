/* @flow */

import React, { Component } from 'react';
import storeShape from './storeShape';
import type { Store } from './ConnectTypes';

export default (Target: ReactClass): ReactClass => {
	return class Container extends Component<{}, {}, { store: Store }> {
		static contextTypes = {
			store: storeShape.isRequired
		};

		render() {
			return <Target {...this.props} store={this.context.store} />;
		}
	};
};
