/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Colors from '../../Colors';
import AppText from './AppText';
import AppTextInput from './AppTextInput';
import StatusbarWrapper from './StatusbarWrapper';
import AppbarSecondary from './AppbarSecondary';
import AppbarTouchable from './AppbarTouchable';
import AppbarIcon from './AppbarIcon';
import GrowingTextInput from './GrowingTextInput';
import TouchFeedback from './TouchFeedback';
import Icon from './Icon';
import AvatarContainer from '../containers/AvatarContainer';
import ImageUploadContainer from '../containers/ImageUploadContainer';
import Banner from './Banner';
import ImageUploadDiscussion from './ImageUploadDiscussion';
import KeyboardSpacer from './KeyboardSpacer';
import ImageChooser from '../../modules/ImageChooser';

const {
	AsyncStorage,
	TouchableOpacity,
	StyleSheet,
	NavigationActions,
	ScrollView,
	View
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white
	},
	scene: {
		paddingHorizontal: 8,
		paddingVertical: 16
	},
	threadName: {
		fontWeight: 'bold',
		fontSize: 20,
		lineHeight: 30
	},
	threadSummary: {
		fontSize: 16,
		lineHeight: 24,
		margin: 0,
	},
	icon: {
		color: Colors.fadedBlack
	},
	disabled: {
		opacity: 0.5
	},
	userIcon: {
		margin: 12
	},
	entry: {
		paddingVertical: 4,
		paddingHorizontal: 12
	},
	uploadButtonIcon: {
		color: Colors.fadedBlack,
		marginHorizontal: 16,
		marginVertical: 14
	},
	uploadButtonIconActive: {
		color: Colors.info
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderTopColor: Colors.separator,
		borderTopWidth: 1
	},
	postButton: {
		backgroundColor: Colors.info,
		margin: 6,
		width: 100,
		borderRadius: 3
	},
	postButtonInner: {
		paddingVertical: 10,
		paddingHorizontal: 16
	},
	postButtonText: {
		color: Colors.white,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	socialItem: {
		flexDirection: 'row',
		alignItems: 'center',
		margin: 12
	},
	socialIconContainer: {
		height: 28,
		width: 28,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: Colors.grey,
		borderRadius: 2
	},
	socialIconContainerSelected: {
		backgroundColor: Colors.facebook
	},
	socialIcon: {
		fontSize: 28,
		color: Colors.white
	},
	socialTextContainer: {
		marginHorizontal: 12,
		color: Colors.fadedBlack,
		bottom: -3
	},
	socialTextSelected: {
		color: Colors.facebook,
		fontWeight: 'bold'
	},
	socialLabel: {
		fontSize: 12,
		lineHeight: 18,
	},
	socialTip: {
		fontSize: 10,
		lineHeight: 15,
		opacity: 0.5,
		fontWeight: 'normal'
	}
});

const FACEBOOK_SHARE_CHECKED_KEY = 'start_discussion_facebook_share_checked';

type Props = {
	user: string;
	room: {
		id: string
	};
	dismiss: Function;
	startThread: Function;
	onNavigation: Function;
}

type State = {
	name: string;
	body: string;
	upload: ?{
		originalUrl: string;
		thumbnailUrl: string;
	};
	photo: ?{
		uri: string;
		size: number;
		name: string;
		height: number;
		width: number;
	};
	status: 'loading' | null;
	error: ?string;
	shareOnFacebook: boolean;
}

export default class StartDiscussionButton extends Component<void, Props, State> {
	static propTypes = {
		user: PropTypes.string.isRequired,
		room: PropTypes.shape({
			id: PropTypes.string.isRequired
		}).isRequired,
		dismiss: PropTypes.func.isRequired,
		startThread: PropTypes.func.isRequired,
		onNavigation: PropTypes.func.isRequired
	};

	state: State = {
		name: '',
		body: '',
		photo: null,
		upload: null,
		status: null,
		error: null,
		shareOnFacebook: false
	};

	componentDidMount() {
		this._setShareCheckbox();
	}

	_handleSharePress: Function = () => {
		global.requestAnimationFrame(async () => {
			let shareOnFacebook = !this.state.shareOnFacebook;

			if (shareOnFacebook) {
				try {
					// await this.props.requestFacebookPermissions();
				} catch (err) {
					shareOnFacebook = false;
				}
			}

			this.setState({
				shareOnFacebook
			});

			AsyncStorage.setItem(FACEBOOK_SHARE_CHECKED_KEY, JSON.stringify(shareOnFacebook));
		});
	};

	_setShareCheckbox: Function = async (): Promise<any> => {
		let shareOnFacebook;

		try {
			const isEnabled = JSON.parse(await AsyncStorage.getItem(FACEBOOK_SHARE_CHECKED_KEY));

			if (isEnabled) {
				// const granted = await this.props.isFacebookPermissionGranted();
				const granted = false;

				shareOnFacebook = granted;
			} else {
				shareOnFacebook = false;
			}
		} catch (err) {
			shareOnFacebook = false;
		}

		this.setState({
			shareOnFacebook
		});
	};

	_handleLoading: Function = () => {
		this.setState({
			status: 'loading'
		});
	};

	_handlePosted: Function = thread => {
		this.props.onNavigation(new NavigationActions.Push({
			name: 'chat',
			props: {
				thread: thread.id,
				room: this.props.room.id
			}
		}));
	};

	_handleError: Function = message => {
		this.setState({
			error: message,
			status: null
		});
	};

	_postDiscussion: Function = () => {
		const SHORT_TITLE_MESSAGE = 'Name needs be at least 2 words';
		const LONG_TITLE_MESSAGE = 'Name needs be less than 10 words';
		const NO_TITLE_MESSAGE = 'Enter a title in 2 to 10 words';
		const NO_SUMMARY_MESSAGE = 'Enter a short summary';

		if (!this.state.name) {
			this._handleError(NO_TITLE_MESSAGE);
			return;
		}

		if (!this.state.body) {
			this._handleError(NO_SUMMARY_MESSAGE);
			return;
		}

		const words = this.state.name.trim().split(/\s+/);

		if (words.length < 2) {
			this._handleError(SHORT_TITLE_MESSAGE);
			return;
		} else if (words.length > 10) {
			this._handleError(LONG_TITLE_MESSAGE);
			return;
		}

		let meta;

		if (this.state.upload && this.state.photo) {
			const { upload } = this.state;
			const { height, width, name } = this.state.photo;
			const aspectRatio = height / width;

			meta = {
				photo: {
					height,
					width,
					title: name,
					url: upload.originalUrl,
					thumbnail_height: Math.min(480, width) * aspectRatio,
					thumbnail_width: Math.min(480, width),
					thumbnail_url: upload.thumbnailUrl
				}
			};
		}

		this._handleLoading();

		this.props.startThread(
			this.state.name,
			this.state.body,
			meta
		);
	};

	_handlePress: Function = () => {
		if (this.state.status === 'loading') {
			return;
		}

		this._postDiscussion();
	};

	_handleChangeName: Function = name => {
		this.setState({
			name,
			error: null
		});
	};

	_handleChangeBody: Function = body => {
		this.setState({
			body,
			error: null
		});
	};

	_handleUploadImage: Function = async () => {
		try {
			this.setState({
				photo: null
			});

			const photo = await ImageChooser.pickImage();

			this.setState({
				photo
			});
		} catch (e) {
			// Do nothing
		}
	};

	_handleUploadFinish: Function = upload => {
		this.setState({
			upload,
			error: null
		});
	};

	_handleUploadClose: Function = () => {
		this.setState({
			photo: null,
			upload: null,
			error: null
		});
	};

	render() {
		const isLoading = this.state.status === 'loading';
		const isDisabled = !(this.state.name && (this.state.body || this.state.meta && this.state.meta.photo) && !isLoading);

		return (
			<View style={styles.container}>
				<StatusbarWrapper />

				<AppbarSecondary>
					<AppbarTouchable type='secondary' onPress={this.props.dismiss}>
						<AppbarIcon name='close' style={styles.icon} />
					</AppbarTouchable>

					<AvatarContainer
						user={this.props.user}
						style={styles.userIcon}
						size={30}
					/>
				</AppbarSecondary>

				<Banner text={this.state.error} type='error' />

				<ScrollView style={styles.scene} keyboardShouldPersistTaps>
					<AppTextInput
						autoFocus
						value={this.state.name}
						onChangeText={this._handleChangeName}
						placeholder='Write a discussion title'
						autoCapitalize='sentences'
						style={[ styles.threadName, styles.entry ]}
						underlineColorAndroid='transparent'
					/>

					{this.state.photo ?
						<ImageUploadContainer
							component={ImageUploadDiscussion}
							imageData={this.state.photo}
							onUploadClose={this._handleUploadClose}
							onUploadFinish={this._handleUploadFinish}
							autoStart
						/> :
						<GrowingTextInput
							numberOfLines={5}
							value={this.state.body}
							onChangeText={this._handleChangeBody}
							placeholder='And a short summary'
							autoCapitalize='sentences'
							inputStyle={[ styles.threadSummary, styles.entry ]}
							underlineColorAndroid='transparent'
						/>
					}

					<TouchableOpacity onPress={this._handleSharePress}>
						<View style={styles.socialItem}>
							<View style={[ styles.socialIconContainer, this.state.shareOnFacebook ? styles.socialIconContainerSelected : null ]}>
								<EvilIcons name='sc-facebook' style={styles.socialIcon} />
							</View>
							<AppText style={[ styles.socialTextContainer, this.state.shareOnFacebook ? styles.socialTextSelected : null ]}>
								<AppText style={styles.socialLabel}>
									{this.state.shareOnFacebook ?
										'This will appear on your timeline\n' :
										'Tap to share this with your friends\n'
									}
								</AppText>
								<AppText style={styles.socialTip}>Tip: Sharing improves your discussion’s reach</AppText>
							</AppText>
						</View>
					</TouchableOpacity>
				</ScrollView>
				<View style={styles.footer}>
					<TouchFeedback
						borderless
						onPress={this._handleUploadImage}
					>
						<View style={styles.uploadButton}>
							<Icon
								name='image'
								style={[ styles.uploadButtonIcon, this.state.photo ? styles.uploadButtonIconActive : null ]}
								size={24}
							/>
						</View>
					</TouchFeedback>
					<View style={[ styles.postButton, isDisabled ? styles.disabled : null ]}>
						{isDisabled ?
							<View style={styles.postButtonInner}>
								<AppText style={styles.postButtonText}>{isLoading ? 'Posting…' : 'Post'}</AppText>
							</View> :
							<TouchFeedback onPress={this._handlePress}>
								<View style={styles.postButtonInner}>
									<AppText style={styles.postButtonText}>Post</AppText>
								</View>
							</TouchFeedback>
						}
					</View>
				</View>
				<KeyboardSpacer />
			</View>
		);
	}
}
