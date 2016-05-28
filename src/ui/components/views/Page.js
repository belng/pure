/* @flow */

import React, { PropTypes, Component } from 'react';
import shallowEqual from 'shallowequal';
import Radium from 'radium';

const styles = {
	page: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100%',
		width: '100%',
	},
};

type Props = {
	children?: Element;
	style?: any;
}

class Page extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.node.isRequired,
		style: PropTypes.any,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return (
			<div style={[ styles.page, this.props.style ]}>
				{this.props.children}
			</div>
		);
	}
}

export default Radium(Page);
