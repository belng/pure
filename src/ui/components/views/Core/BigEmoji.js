/* @flow */

import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from './AppText';

const styles = {
	emojiOnly: {
		textAlign: 'center',
		fontSize: 32,
		lineHeight: 1.5,
	},
};

type Props = {
	children?: string;
	style?: any;
}

class BigEmoji extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.string.isRequired,
		style: AppText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<AppText {...this.props} style={[ styles.emojiOnly, this.props.style ]}>
				{this.props.children}
			</AppText>
		);
	}
}

export default Radium(BigEmoji);
