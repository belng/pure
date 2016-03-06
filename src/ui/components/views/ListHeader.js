/* @flow */

import React, { PropTypes } from 'react';
import ReactNative from 'react-native';
import AppText from './AppText';
import Colors from '../../Colors';

const {
	View,
	StyleSheet
} = ReactNative;

const styles = StyleSheet.create({
	header: {
		paddingHorizontal: 16,
		paddingVertical: 12
	},
	headerText: {
		color: Colors.fadedBlack,
		fontSize: 12,
		lineHeight: 18,
		fontWeight: 'bold'
	}
});

type Props = {
	children?: string;
}

const ListHeader = ({ children }: Props) => {
	return (
		<View style={styles.header}>
			<AppText style={styles.headerText}>{children && children.toUpperCase()}</AppText>
		</View>
	);
};

ListHeader.propTypes = {
	children: PropTypes.string.isRequired
};

export default ListHeader;
