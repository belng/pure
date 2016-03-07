/* @flow */

import React from 'react';
import ReactNative from 'react-native';
import Colors from '../../Colors';
import AppText from './AppText';
import Page from './Page';

const {
	StyleSheet,
	Image
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		padding: 16,
		backgroundColor: Colors.primary
	},
	image: {
		marginHorizontal: 16,
		marginVertical: 48
	},
	header: {
		color: Colors.white,
		fontSize: 20,
		lineHeight: 30
	},
	footer: {
		color: Colors.white,
	}
});

const Offline = (props: { style?: any }) => (
	<Page {...props} style={[ styles.container, props.style ]}>
		<AppText style={styles.header}>Network unavailable!</AppText>
		<Image style={styles.image} source={require('../../../../assets/astronaut.png')} />
		<AppText style={styles.footer}>Waiting for connection…</AppText>
	</Page>
);

Offline.propTypes = {
	style: Page.propTypes.style
};

export default Offline;
