/* @flow */

import React from 'react-native';
import Colors from '../../../Colors';
import AppText from '../AppText';
import PageLoading from '../PageLoading';
import PageEmpty from '../PageEmpty';
import AvatarRound from '../AvatarRound';
import GrowingTextInput from '../GrowingTextInput';
import Modal from '../Modal';
import AccountPhotoChooser from './AccountPhotoChooser';
import TouchFeedback from '../TouchFeedback';
import PushNotification from '../../../modules/PushNotification';
import debounce from '../../../../lib/debounce';
import type { User } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	ScrollView,
	View,
	PixelRatio,
	TouchableOpacity,
	TextInput,
	Switch
} = React;

const styles = StyleSheet.create({
	info: {
		flex: 1,
		marginLeft: 16
	},
	nick: {
		color: Colors.darkGrey,
		fontWeight: 'bold'
	},
	email: {
		fontSize: 12,
		lineHeight: 18
	},
	settings: {
		alignItems: 'stretch',
		backgroundColor: Colors.white
	},
	inputContainer: {
		borderColor: Colors.separator,
		borderBottomWidth: 1 / PixelRatio.get(),
		paddingVertical: 8
	},
	inputLabelText: {
		fontSize: 12,
		lineHeight: 18,
		marginHorizontal: 16
	},
	input: {
		paddingVertical: 8,
		marginVertical: 0,
		marginHorizontal: 12
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		borderColor: Colors.separator,
		borderBottomWidth: 1 / PixelRatio.get(),
		padding: 16
	},
	itemLabel: {
		flex: 1
	},
	itemText: {
		color: Colors.darkGrey
	},
	itemValueText: {
		fontSize: 12,
		lineHeight: 18
	},
});

type Props = {
	user: User
}

type State = {
	pushNotificationEnabled: boolean
}

const PUSH_NOTIFICATION_ENABLED_KEY = 'enabled';

export default class Account extends React.Component<void, Props, State> {
	_saveUser: Function;

	constructor(props: Props) {
		super(props);

		this._saveUser = debounce(this.props.saveUser, 1000);

		this.state = {
			pushNotificationEnabled: true,
		};
	}

	componentWillMount() {
		this._updatePushNotificationValue();
	}

	_updatePushNotificationValue = async (): Promise<void> => {
		let value = true;

		try {
			value = await PushNotification.getPreference(PUSH_NOTIFICATION_ENABLED_KEY);
		} catch (e) {
			// Ignore
		}

		this.setState({
			pushNotificationEnabled: value !== 'false'
		});
	};

	_handleStatusChange = (description: string) => {
		this._saveUser({ ...this.props.user, description });
	};

	_handleNameChange = (name: string) => {
		this._saveUser({ ...this.props.user, name });
	};

	_handlePushNotificationChange = (value: boolean) => {
		PushNotification.setPreference(PUSH_NOTIFICATION_ENABLED_KEY, value ? 'true' : 'false');

		this.setState({
			pushNotificationEnabled: value
		});
	};

	_handleEmailNotificationChange = (value: string) => {
		const {
			user: {
				params
			}
		} = this.props.user;

		const email = params.email ? { ...params.email } : {};

		email.notifications = value;

		this.props.saveParams({ ...params, email });
	};

	_handleEmailFrequencyChange = (value: string) => {
		const {
			user: {
				params
			}
		} = this.props.user;

		const email = params.email ? { ...params.email } : {};

		email.frequency = value;

		this.props.saveParams({ ...params, email });
	};

	_handleSelectFrequency = () => {
		const options = [ 'Daily', 'Never' ];

		Modal.showActionSheetWithOptions({ options }, i =>
			this._handleEmailFrequencyChange(options[i].toLowerCase())
		);
	};

	_handleSignOut = () => {
		this.props.signOut();
	};

	_handleSelectPhoto = (picture: string) => {
		this.props.saveParams({ ...this.props.user.params, picture });

		Modal.renderComponent(null);
	};

	_handlePhotoChooser = () => {
		const photos = this.props.user.params.pictures;

		if (photos && photos.length > 2) {
			Modal.renderModal(
				<AccountPhotoChooser
					photos={photos}
					onSelect={this._handleSelectPhoto}
				/>
			);
		}
	};

	render() {
		const { user } = this.props;

		if (user === 'missing') {
			return <PageLoading />;
		}

		if (user === 'failed') {
			return <PageEmpty label='Failed to load account' image='sad' />;
		}

		return (
			<ScrollView contentContainerStyle={styles.settings}>
				<TouchableOpacity onPress={this._handlePhotoChooser}>
					<View style={styles.item}>
						<AvatarRound
							size={48}
							nick={user.id}
						/>
						<View style={styles.info}>
							<AppText style={styles.nick}>{user.name ? `${user.name} (${user.id})` : user.id}</AppText>
							<AppText style={styles.email}>{user.identities[0].slice(7)}</AppText>
						</View>
					</View>
				</TouchableOpacity>
				<View style={styles.inputContainer}>
					<AppText style={styles.inputLabelText}>Status message</AppText>
					<GrowingTextInput
						inputStyle={styles.input}
						defaultValue={user.description}
						placeholder='Status message'
						autoCapitalize='sentences'
						numberOfLines={5}
						onChangeText={this._handleStatusChange}
					/>
				</View>
				<View style={styles.inputContainer}>
					<AppText style={styles.inputLabelText}>Fullname</AppText>
					<TextInput
						style={styles.input}
						defaultValue={user.name}
						placeholder='Fullname'
						autoCapitalize='words'
						onChangeText={this._handleNameChange}
					/>
				</View>
				<View style={styles.item}>
					<View style={styles.itemLabel}>
						<AppText style={styles.itemText}>Push notifications</AppText>
					</View>
					<Switch
						value={this.state.pushNotificationEnabled}
						onValueChange={this._handlePushNotificationChange}
					/>
				</View>
				<View style={styles.item}>
					<View style={styles.itemLabel}>
						<AppText style={styles.itemText}>Mention notifications via email</AppText>
					</View>
					<Switch
						value={user.params && user.params.email ? user.params.email.notifications !== false : false}
						onValueChange={this._handleEmailNotificationChange}
					/>
				</View>
				<TouchFeedback onPress={this._handleSelectFrequency}>
					<View style={styles.item}>
						<View style={styles.itemLabel}>
							<AppText style={styles.itemText}>Email digest frequency</AppText>
							<AppText style={styles.itemValueText}>
								{user.params && user.params.email && user.params.email.frequency ?
									user.params.email.frequency.charAt(0).toUpperCase() + user.params.email.frequency.slice(1) :
									'Daily'
								}
							</AppText>
						</View>
					</View>
				</TouchFeedback>
				<TouchFeedback onPress={this._handleSignOut}>
					<View style={styles.item}>
						<View style={styles.itemLabel}>
							<AppText style={styles.itemText}>Sign out</AppText>
						</View>
					</View>
				</TouchFeedback>
			</ScrollView>
		);
	}
}

Account.propTypes = {
	user: React.PropTypes.oneOfType([
		React.PropTypes.oneOf([ 'missing', 'failed' ]),
		React.PropTypes.shape({
			id: React.PropTypes.string,
			params: React.PropTypes.object
		})
	]).isRequired,
	saveUser: React.PropTypes.func.isRequired,
	saveParams: React.PropTypes.func.isRequired,
	signOut: React.PropTypes.func.isRequired,
	onNavigation: React.PropTypes.func.isRequired
};
