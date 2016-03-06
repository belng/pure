/* @flow */

import React, { PropTypes } from 'react';
import ReactNative from 'react-native';
import TouchFeedback from './TouchFeedback';
import Colors from '../../Colors';

const {
	StyleSheet,
	PixelRatio,
	View
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.white,
		borderColor: Colors.separator,
		borderBottomWidth: 1 / PixelRatio.get(),
		height: 64
	},
});

type Props = {
	children?: any;
	containerStyle?: any;
}

const ListItem = (props: Props) => (
	<TouchFeedback {...props}>
		<View style={[ styles.container, props.containerStyle ]}>
			{props.children}
		</View>
	</TouchFeedback>
);

ListItem.propTypes = {
	children: PropTypes.node.isRequired,
	containerStyle: View.propTypes.style
};

export default ListItem;
