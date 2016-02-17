/* @flow */

import React, { Component } from 'react';
import storeShape from './storeShape';
import type { Store } from './ConnectTypes';

export default (Target: ReactClass): ReactClass => {
	return class Connect extends Component<{}, {}, { store: Store }> {
		static contextTypes = {
			store: storeShape.isRequired
		};

		render() {
			return <Target {...this.props} store={this.context.store} />;
		}
	};
};
