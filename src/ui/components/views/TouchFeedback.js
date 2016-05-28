/* @flow */

import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import shallowEqual from 'shallowequal';

type Props = {
	onPress?: ?Function;
	borderless?: boolean;
	pressColor?: string;
	children?: Element;
	style?: any;
}

const styles = {
	button: {
		position: 'relative',
		cursor: 'pointer',
	},
};

class TouchFeedback extends Component<void, Props, void> {
	static propTypes = {
		onPress: PropTypes.func,
		borderless: PropTypes.bool,
		pressColor: PropTypes.string,
		children: PropTypes.node.isRequired,
		style: PropTypes.any,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return (
			<div
				{...this.props}
				style={[ styles.button, this.props.style ]}
				onClick={this.props.onPress}
			>
				{this.props.children}
			</div>
		);
	}
}

export default Radium(TouchFeedback);
