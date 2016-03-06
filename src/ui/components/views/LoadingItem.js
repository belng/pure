/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import LoadingFancy from './LoadingFancy';

const {
	StyleSheet,
	View
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		alignSelf: 'stretch',
		alignItems: 'center'
	}
});

type Props = {
	style?: any;
}

export default class LoadingItem extends Component<void, Props, void> {
	static propTypes = {
		style: View.propTypes.style
	};

	render() {
		return (
			<View style={[ styles.container, this.props.style ]}>
				<LoadingFancy />
			</View>
		);
	}
}
