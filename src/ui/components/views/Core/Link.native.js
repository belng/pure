/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from './AppText';
import Colors from '../../../Colors';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	link: {
		color: Colors.info,
	},
});

type Props = {
	children?: React.Element;
	url?: string;
	onPress?: Function;
	openLink: Function;
	style?: any;
}

export default class Link extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.string.isRequired,
		url: PropTypes.string,
		onPress: PropTypes.func,
		openLink: PropTypes.func.isRequired,
		style: AppText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handlePress = (e: SyntheticEvent) => {
		if (this.props.onPress) {
			this.props.onPress(e);
		}

		this.props.openLink(this.props.url);
	};

	render() {
		return (
			<AppText
				{...this.props}
				onPress={this._handlePress}
				style={[ styles.link, this.props.style ]}
			>
				{this.props.children}
			</AppText>
		);
	}
}
