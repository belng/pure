/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import AppText from '../AppText';
import Icon from '../Icon';
import Colors from '../../../Colors';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		padding: 16,
		backgroundColor: Colors.white,
	},
	header: {
		flexDirection: 'row',
	},
	icon: {
		marginHorizontal: 8,
		marginVertical: 6,
		color: Colors.primary,
	},
	title: {
		color: Colors.primary,
		fontWeight: 'bold',
		fontSize: 16,
		lineHeight: 24,
		margin: 8,
	},
	summary: {
		margin: 8,
		color: Colors.darkGrey,
	}
});

type Props = {
	type: 'home' | 'work' | 'hometown';
	style?: any;
}

const TYPES = {
	home: {
		title: 'Where do you live?',
		summary: 'Type and pick your apartment, street or neighborhood.',
		icon: 'location-city'
	},
	work: {
		title: 'Where do you work?',
		summary: 'Type and pick your office or college.',
		icon: 'work'
	},
	hometown: {
		title: 'Where are you from?',
		summary: 'Type and pick your hometown.',
		icon: 'home'
	}
};

export default class PlacesSelectorTip extends Component<void, Props, void> {
	static propTypes = {
		type: PropTypes.oneOf([ 'home', 'work', 'hometown' ]).isRequired,
		style: View.propTypes.style,
	};

	render() {
		const data = TYPES[this.props.type];

		return (
			<View style={[ styles.container, this.props.style ]}>
				<View style={styles.header}>
					<Icon
						style={styles.icon}
						name={data.icon}
						size={24}
					/>
					<AppText style={styles.title}>{data.title}</AppText>
				</View>
				<AppText style={styles.summary}>{data.summary}</AppText>
			</View>
		);
	}
}
