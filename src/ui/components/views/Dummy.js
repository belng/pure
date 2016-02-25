/* @flow */

import React from 'react';
import ReactNative from 'react-native';

const {
	StyleSheet,
	View,
	Text
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	}
});

const Dummy = () => (
	<View style={styles.container}>
		<Text>
			¯\_(ツ)_/¯
		</Text>
	</View>
);

export default Dummy;
