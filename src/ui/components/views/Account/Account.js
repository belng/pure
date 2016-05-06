/* @flow */

import React, { Component, PropTypes } from 'react';
import debounce from 'lodash/debounce';
import ReactNative from 'react-native';
import Colors from '../../../Colors';
import AppText from '../AppText';
import PageLoading from '../PageLoading';
import PageEmpty from '../PageEmpty';
import AvatarRound from '../AvatarRound';
import GrowingTextInput from '../GrowingTextInput';
import Modal from '../Modal';
import TouchFeedback from '../TouchFeedback';
import GCMPreferences from '../../../modules/GCMPreferences';
import type { User } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	ScrollView,
	View,
	PixelRatio,
	TextInput,
	Switch,
} = ReactNative;

const styles = StyleSheet.create({
	info: {
		flex: 1,
		marginLeft: 16,
	},
	nick: {
		color: Colors.darkGrey,
		fontWeight: 'bold',
	},
	email: {
		fontSize: 12,
		lineHeight: 18,
	},
	settings: {
		alignItems: 'stretch',
		backgroundColor: Colors.white,
	},
	inputContainer: {
		borderColor: Colors.separator,
		borderBottomWidth: 1 / PixelRatio.get(),
		paddingVertical: 8,
	},
	inputLabelText: {
		fontSize: 12,
		lineHeight: 18,
		marginHorizontal: 16,
		fontWeight: 'bold',
		color: Colors.fadedBlack,
	},
	input: {
		paddingVertical: 8,
		marginVertical: 0,
		marginHorizontal: 12,
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		borderColor: Colors.separator,
		borderBottomWidth: 1 / PixelRatio.get(),
		padding: 16,
	},
	itemLabel: {
		flex: 1,
	},
	itemText: {
		color: Colors.darkGrey,
	},
	itemValueText: {
		fontSize: 12,
		lineHeight: 18,
	},
});

type Props = {
	user: { type: 'loading' } | User | null;
	saveUser: () => void;
	saveParams: () => void;
	signOut: () => void;
	onNavigation: () => void;
}

type State = {
	GCMEnabled: boolean
}

const PUSH_NOTIFICATION_ENABLED_KEY = 'enabled';

export default class Account extends Component<void, Props, State> {
	static propTypes = {
		user: PropTypes.oneOfType([
			PropTypes.oneOf([ 'loading' ]),
			PropTypes.shape({
				id: PropTypes.string,
				meta: PropTypes.object,
				params: PropTypes.object,
			}),
		]),
		saveUser: PropTypes.func.isRequired,
		saveParams: PropTypes.func.isRequired,
		signOut: PropTypes.func.isRequired,
		onNavigation: PropTypes.func.isRequired,
	};

	state: State = {
		GCMEnabled: true,
	};

	componentWillMount() {
		this._updateGCMValue();
	}

	_saveUser: Function = debounce(user => this.props.saveUser(user), 1000);

	_updateGCMValue: Function = async (): Promise<void> => {
		let value = true;

		try {
			value = await GCMPreferences.getPreference(PUSH_NOTIFICATION_ENABLED_KEY);
		} catch (e) {
			// Ignore
		}

		this.setState({
			GCMEnabled: value !== 'false',
		});
	};

	_handleStatusChange: Function = (description: string) => {
		const {
			user,
		} = this.props;

		const meta = user && user.meta ? { ...user.meta } : {};

		meta.description = description;

		this._saveUser({ ...this.props.user, meta });
	};

	_handleNameChange: Function = (name: string) => {
		this._saveUser({ ...this.props.user, name });
	};

	_handleGCMChange: Function = (value: boolean) => {
		GCMPreferences.setPreference(PUSH_NOTIFICATION_ENABLED_KEY, value ? 'true' : 'false');

		this.setState({
			GCMEnabled: value,
		});
	};

	_handleEmailNotificationChange: Function = (value: string) => {
		const {
			user,
		} = this.props;

		const params = user && user.params ? { ...user.params } : {};
		const email = params.email ? { ...params.email } : {};

		email.notifications = value;

		this.props.saveParams({ ...params, email });
	};

	_handleEmailFrequencyChange: Function = (value: string) => {
		const {
			user,
		} = this.props;

		const params = user && user.params ? { ...user.params } : {};
		const email = params.email ? { ...params.email } : {};

		email.frequency = value;

		this.props.saveParams({ ...params, email });
	};

	_handleSelectFrequency: Function = () => {
		const options = [ 'Daily', 'Never' ];

		Modal.showActionSheetWithOptions({ options }, i =>
			this._handleEmailFrequencyChange(options[i].toLowerCase())
		);
	};

	_handleSignOut: Function = () => {
		this.props.signOut();
	};

	render() {
		const { user } = this.props;

		if (!user) {
			return <PageEmpty label='Failed to load account' image='sad' />;
		}

		if (user && user.type === 'loading') {
			return <PageLoading />;
		}

		let email;

		if (user.params) {
			email = user.params.email;
		}

		return (
			<ScrollView contentContainerStyle={styles.settings}>
				<View style={styles.item}>
					<AvatarRound
						size={48}
						user={user.id}
					/>
					<View style={styles.info}>
						<AppText style={styles.nick}>{user.id}</AppText>
						<AppText style={styles.email}>{user.identities[user.identities.length - 1].slice(7)}</AppText>
					</View>
				</View>
				<View style={styles.inputContainer}>
					<AppText style={styles.inputLabelText}>FULL NAME</AppText>
					<TextInput
						style={styles.input}
						defaultValue={user.name}
						placeholder='Full name'
						autoCapitalize='words'
						onChangeText={this._handleNameChange}
					/>
				</View>
				<View style={styles.inputContainer}>
					<AppText style={styles.inputLabelText}>STATUS MESSAGE</AppText>
					<GrowingTextInput
						inputStyle={styles.input}
						defaultValue={user.meta ? user.meta.description : ''}
						placeholder='Status message'
						autoCapitalize='sentences'
						numberOfLines={5}
						onChangeText={this._handleStatusChange}
					/>
				</View>
				<View style={styles.item}>
					<View style={styles.itemLabel}>
						<AppText style={styles.itemText}>Push notifications</AppText>
					</View>
					<Switch
						value={this.state.GCMEnabled}
						onValueChange={this._handleGCMChange}
					/>
				</View>
				<View style={styles.item}>
					<View style={styles.itemLabel}>
						<AppText style={styles.itemText}>Mention notifications via email</AppText>
					</View>
					<Switch
						value={email ? email.notifications !== false : false}
						onValueChange={this._handleEmailNotificationChange}
					/>
				</View>
				<TouchFeedback onPress={this._handleSelectFrequency}>
					<View style={styles.item}>
						<View style={styles.itemLabel}>
							<AppText style={styles.itemText}>Email digest frequency</AppText>
							<AppText style={styles.itemValueText}>
								{email && email.frequency ?
									email.frequency.charAt(0).toUpperCase() + email.frequency.slice(1) :
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
