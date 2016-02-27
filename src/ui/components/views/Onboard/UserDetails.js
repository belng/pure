/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import NextButton from './NextButton';
import StatusbarWrapper from '../StatusbarWrapper';
import AppTextInput from '../AppTextInput';
import KeyboardSpacer from '../KeyboardSpacer';
import OnboardTitle from './OnboardTitle';
import OnboardParagraph from './OnboardParagraph';
import OnboardError from './OnboardError';
import Icon from '../Icon';
import VersionCodes from '../../../modules/VersionCodes';
import EnhancedError from '../../../../lib/EnhancedError';
import Colors from '../../../Colors';

const {
	View,
	ScrollView,
	Image,
	StyleSheet,
	Platform,
	TouchableOpacity,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white
	},

	inner: {
		alignItems: 'center',
		justifyContent: 'center'
	},

	avatar: {
		height: 96,
		width: 96,
		borderRadius: 48
	},

	avatarContainer: {
		margin: 16,
		height: 96,
		width: 96,
		borderRadius: 48,
		backgroundColor: Colors.placeholder
	},

	inputContainer: {
		width: 200,
		marginHorizontal: 16,
	},

	closeButtonContainer: {
		alignSelf: 'flex-start'
	},

	closeButton: {
		margin: 16,
		color: Colors.fadedBlack
	},

	input: {
		textAlign: 'center'
	}
});

type Props = {
	canGoForward: boolean;
	cancelSignUp: Function;
	submitUserDetails: Function;
	onChangeField: Function;
	fields: {
		nick: { value: string; error: ?EnhancedError };
		name: { value: string; error: ?EnhancedError };
		picture: { value: string; error: void };
	};
};

export default class UserDetails extends Component<void, Props, void> {
	static propTypes = {
		canGoForward: PropTypes.bool.isRequired,
		cancelSignUp: PropTypes.func.isRequired,
		submitUserDetails: PropTypes.func.isRequired,
		onChangeField: PropTypes.func.isRequired,
		fields: PropTypes.objectOf(PropTypes.shape({
			nick: PropTypes.shape({
				value: PropTypes.string,
				error: PropTypes.instanceOf(EnhancedError)
			}).isRequired,
			name: PropTypes.shape({
				value: PropTypes.string,
				error: PropTypes.instanceOf(EnhancedError)
			}).isRequired
		})).isRequired,
	};

	_handleChangeNick = (nick: string): void => {
		this.props.onChangeField('nick', nick);
	};

	_handleChangeName = (name: string): void => {
		this.props.onChangeField('name', name);
	};

	render() {
		const { fields } = this.props;
		const {
			nick,
			name,
			picture
		} = fields;

		const nickColor = nick.error ? Colors.error : Colors.placeholder;
		const nameColor = name.error ? Colors.error : Colors.placeholder;

		return (
			<View style={styles.container}>
				<ScrollView keyboardShouldPersistTaps contentContainerStyle={[ styles.container, styles.inner ]}>
					<StatusbarWrapper />
					<TouchableOpacity style={styles.closeButtonContainer} onPress={this.props.cancelSignUp}>
						<Icon
							name='close'
							size={24}
							style={styles.closeButton}
						/>
					</TouchableOpacity>
					<OnboardTitle>Create an Account!</OnboardTitle>
					<View style={styles.avatarContainer}>
						<Image style={styles.avatar} source={{ uri: picture.value }} />
					</View>
					<OnboardParagraph>What should we call you?</OnboardParagraph>

					<View style={styles.inputContainer}>
						<AppTextInput
							style={styles.input}
							autoCapitalize='none'
							autoCorrect={false}
							maxLength={32}
							placeholder='Username, e.g. barry43'
							underlineColorAndroid={nickColor}
							onChangeText={this._handleChangeNick}
							value={nick.value}
						/>
						<AppTextInput
							style={styles.input}
							autoCapitalize='words'
							placeholder='Fullname, e.g. Barry Allen'
							underlineColorAndroid={nameColor}
							onChangeText={this._handleChangeName}
							value={name.value}
						/>
					</View>

					<OnboardError
						hint='People on Hey, Neighbor! will know you by your username.'
						message={nick.error ? nick.error.message : name.error ? name.error.message : null}
					/>

					<KeyboardSpacer />
				</ScrollView>
				<NextButton
					label='Sign up'
					disabled={this.props.canGoForward}
					onPress={this.props.submitUserDetails}
				/>
				{Platform.Version >= VersionCodes.KITKAT ?
					<KeyboardSpacer /> :
					null // Android seems to Pan the screen on < Kitkat
				}
			</View>
		);
	}
}
