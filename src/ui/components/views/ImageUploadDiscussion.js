/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import Colors from '../../Colors';
import CloseButton from './CloseButton';
import ImageUploadButton from './ImageUploadButton';

const {
	StyleSheet,
	View,
	Image
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 16,
		paddingVertical: 32
	},
	thumbnailContainer: {
		elevation: 4
	},
	thumbnailStyle: {
		alignItems: 'center',
		justifyContent: 'center'
	},
	iconIdle: {
		color: Colors.fadedBlack
	},
	iconError: {
		marginTop: 14,
		marginBottom: 18
	},
	closeButton: {
		position: 'absolute',
		top: 16,
		left: 0
	}
});

export default class ChatInput extends Component {
	_onClose = () => {
		this.props.closeUpload();
	};

	_onPress = () => {
		if (this.props.status === 'loading') {
			this.props.cancelUpload();
		} else if (this.props.status === 'idle' || this.props.status === 'error') {
			this.props.startUpload();
		}
	};

	render() {
		const { uri, height, width } = this.props.imageData;

		return (
			<View {...this.props} style={[ styles.container, this.props.style ]}>
				<View style={styles.thumbnailContainer}>
					<Image source={{ uri, height: (height / width) * 160, width: 160 }} style={styles.thumbnailStyle}>
						<ImageUploadButton
							onPress={this._onPress}
							status={this.props.status}
							idleIcon='file-upload'
							closeIcon='close'
							doneIcon='done'
							errorIcon='warning'
							idleIconStyle={styles.iconIdle}
							errorIconStyle={styles.iconError}
						/>
					</Image>
				</View>

				<CloseButton onPress={this._onClose} style={styles.closeButton} />
			</View>
		);
	}
}

ChatInput.propTypes = {
	imageData: PropTypes.shape({
		name: PropTypes.string.isRequired,
		uri: PropTypes.string.isRequired,
		height: PropTypes.number.isRequired,
		width: PropTypes.number.isRequired,
		size: PropTypes.number.isRequired
	}).isRequired,
	status: PropTypes.string.isRequired,
	startUpload: PropTypes.func.isRequired,
	cancelUpload: PropTypes.func.isRequired,
	closeUpload: PropTypes.func.isRequired
};
