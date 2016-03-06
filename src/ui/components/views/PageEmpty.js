/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import AppText from './AppText';
import Page from './Page';

const {
	StyleSheet,
	Image
} = ReactNative;

const styles = StyleSheet.create({
	missing: {
		margin: 16,
		textAlign: 'center',
		fontSize: 16,
		lineHeight: 24
	},
});

type Props = {
	label: string;
	image: string;
}

export default class PageEmpty extends Component<void, Props, void> {
	static propTypes = {
		label: PropTypes.string,
		image: PropTypes.any
	};

	_getImageSource: Function = name => {
		switch (name) {
		case 'cool':
			return require('../../../../assets/monkey-cool.png');
		case 'happy':
			return require('../../../../assets/monkey-happy.png');
		case 'meh':
			return require('../../../../assets/monkey-meh.png');
		case 'sad':
			return require('../../../../assets/monkey-sad.png');
		default:
			return null;
		}
	};

	render() {
		const {
			label,
			image,
		} = this.props;

		return (
			<Page {...this.props}>
				{image ?
					<Image source={this._getImageSource(image)} /> :
					null
				}
				{label ?
					<AppText style={styles.missing}>{label}</AppText> :
					null
				}
			</Page>
		);
	}
}
