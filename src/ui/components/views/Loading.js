/* @flow */

import { Component } from 'react';
import shallowEqual from 'shallowequal';

type Props = {
	style?: any;
}

export default class Loading extends Component<void, Props, void> {
	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render(): ?React$Element {
		return null;
	}
}
