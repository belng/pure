/* @flow */

import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import shallowCompare from 'react-addons-shallow-compare';
import Colors from '../../../Colors';

const styles = {
	link: {
		color: Colors.info,
		textDecoration: 'none',
	},
};

type Props = {
	children?: React.Element<*>;
	url?: string;
	style?: any;
}

class Link extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.string.isRequired,
		url: PropTypes.string,
		style: PropTypes.any,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const { url, style, children, ...rest } = this.props;

		return (
			<a
				target='_blank'
				{...rest}
				style={[ styles.link, style ]}
				href={url}
			>
				{children}
			</a>
		);
	}
}

export default Radium(Link);
