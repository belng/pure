/* @flow */

import React, { Children, Component, PropTypes } from 'react';
import Radium from 'radium';
import shallowCompare from 'react-addons-shallow-compare';

type Props = {
	children?: React.Element;
	style?: any;
}

class AppText extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.string.isRequired,
		style: PropTypes.any,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<span {...this.props}>
				{Children.map(this.props.children, child => {
					if (child === '\n') {
						return <br />;
					}
					return child;
				})}
			</span>
		);
	}
}

export default Radium(AppText);
