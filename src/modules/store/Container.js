/* @flow */

import React, { Component } from 'react';
import storeShape from './storeShape';

export default (Target: ReactClass): ReactClass => {
	// $FlowFixMe
	return class Container extends Component<any, any, any> {
		static contextTypes = {
			store: storeShape.isRequired
		};

		render() {
			return <Target {...this.props} store={this.context.store} />;
		}
	};
};
