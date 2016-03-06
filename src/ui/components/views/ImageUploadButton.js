/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import Colors from '../../Colors';
import Icon from './Icon';
import Loading from './Loading';

const {
	StyleSheet,
	TouchableHighlight,
	View
} = ReactNative;

const styles = StyleSheet.create({
	iconContainerOuter: {
		height: 56,
		width: 56,
		borderRadius: 32,
		margin: 8
	},
	iconContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 56,
		width: 56,
		borderRadius: 32
	},
	idleIconContainer: {
		backgroundColor: Colors.accent
	},
	closeIconContainer: {
		backgroundColor: Colors.fadedBlack
	},
	doneIconContainer: {
		backgroundColor: Colors.success
	},
	errorIconContainer: {
		backgroundColor: Colors.error
	},
	icon: {
		color: Colors.white,
		margin: 16
	},
	loading: {
		position: 'absolute',
		left: 2,
		top: 2,
		height: 52,
		width: 52
	}
});

export default class ImageUploadButton extends Component {
	render() {
		let containerStyle, iconStyle, iconName;

		switch (this.props.status) {
		case 'loading':
			containerStyle = styles.closeIconContainer;
			iconStyle = this.props.closeIconStyle;
			iconName = this.props.closeIcon;
			break;
		case 'finished':
			containerStyle = styles.doneIconContainer;
			iconStyle = this.props.doneIconStyle;
			iconName = this.props.doneIcon;
			break;
		case 'error':
			containerStyle = styles.errorIconContainer;
			iconStyle = this.props.errorIconStyle;
			iconName = this.props.errorIcon;
			break;
		default:
			containerStyle = styles.idleIconContainer;
			iconStyle = this.props.idleIconStyle;
			iconName = this.props.idleIcon;
		}

		return (
			<TouchableHighlight
				{...this.props}
				underlayColor={Colors.underlay}
				style={[ styles.iconContainerOuter, this.props.style ]}
			>
				<View style={[ styles.iconContainer, containerStyle ]}>
					<Icon
						name={iconName}
						style={[ styles.icon, iconStyle ]}
						size={24}
					/>

					{this.props.status === 'loading' ? <Loading style={styles.loading} /> : null}
				</View>
			</TouchableHighlight>
		);
	}
}

ImageUploadButton.propTypes = {
	status: PropTypes.string.isRequired,
	closeIcon: PropTypes.string.isRequired,
	closeIconStyle: PropTypes.any,
	doneIcon: PropTypes.string.isRequired,
	doneIconStyle: PropTypes.any,
	errorIcon: PropTypes.string.isRequired,
	errorIconStyle: PropTypes.any,
	idleIcon: PropTypes.string.isRequired,
	idleIconStyle: PropTypes.any
};
