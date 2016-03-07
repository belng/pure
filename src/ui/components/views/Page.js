/* @flow */

import React, { PropTypes } from 'react';
import ReactNative from 'react-native';

const {
	StyleSheet,
	View
} = ReactNative;

const styles = StyleSheet.create({
	page: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	}
});

type Props = {
	children?: Element;
	style?: any;
}

const Page = (props: Props) => (
	<View style={[ styles.page, props.style ]}>
		{props.children}
	</View>
);

Page.propTypes = {
	children: PropTypes.node.isRequired,
	style: View.propTypes.style
};

export default Page;
