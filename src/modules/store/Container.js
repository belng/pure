/* @flow */

import React, { Component } from 'react';
import storeShape from './storeShape';

export default (Target: ReactClass): ReactClass => {
	return class Container extends Component<any, any, void> {
		static contextTypes = {
			store: storeShape.isRequired
		};

		render() {
			return <Target {...this.props} store={this.context.store} />;
		}
	};
};
