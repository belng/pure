/* @flow */

import React, { PropTypes, Component } from 'react';
import isEmpty from 'lodash/isEmpty';
import Connect from '../../../modules/store/Connect';
import Onboard from '../views/Onboard/Onboard';
import EnhancedError from '../../../lib/EnhancedError';
import Validator from '../../../lib/Validator';
import { signIn, signUp, cancelSignUp, saveUser } from '../../../modules/store/actions';
import type { User } from '../../../lib/schemaTypes';

type Props = {
	user: User;
	pendingUser: { signedIdentities: string };
	signIn: Function;
	signUp: Function;
	cancelSignUp: Function;
	savePlaces: Function;
}

type Fields = {
	[key: string]: {
		page: string;
		value: any;
		error: ?EnhancedError
	};
}

type State = {
	fields: Fields;
	page: string;
	onboarding: boolean;
}

const PAGE_LOADING = 'PAGE_LOADING';
const PAGE_SIGN_IN = 'PAGE_SIGN_IN';
const PAGE_USER_DETAILS = 'PAGE_USER_DETAILS';
const PAGE_PLACES = 'PAGE_PLACES';
const PAGE_GET_STARTED = 'PAGE_GET_STARTED';
const PAGE_HOME = 'PAGE_HOME';

class OnboardContainerInner extends Component<void, Props, State> {
	state: State = {
		fields: {
			nick: { page: PAGE_USER_DETAILS, value: '', error: null },
			name: { page: PAGE_USER_DETAILS, value: '', error: null },
			places: { page: PAGE_PLACES, value: [], error: null },
		},
		page: PAGE_LOADING,
		onboarding: false,
	};

	componentWillMount() {
		this._setCurrentPage(this.props);
	}

	componentWillReceiveProps(nextProps) {
		this._setCurrentPage(nextProps);
	}

	_setCurrentPage = (props: Props) => {
		const {
			user,
			pendingUser
		} = props;

		if (pendingUser) {
			// Signing up
			this.setState({
				page: PAGE_USER_DETAILS,
				onboarding: true,
			});
		} else {
			if (user) {
				if (user.params && user.params.places) {
					if (this.state.onboarding) {
						this.setState({
							page: PAGE_HOME
						});
					} else {
						this.setState({
							page: PAGE_GET_STARTED
						});
					}
				} else {
					this.setState({
						page: PAGE_PLACES,
						onboarding: true,
					});
				}
			} else {
				this.setState({
					page: PAGE_SIGN_IN
				});
			}
		}
	};

	_hasErrors = (fields: Fields, page: string): boolean => {
		for (const field in fields) {
			const item = fields[field];

			if (item.page === page && item.error) {
				return true;
			}
		}

		return false;
	};

	_ensureAllFields = (fields: Fields): Fields => {
		for (const field in fields) {
			const item = fields[field];

			if (isEmpty(item.value)) {
				fields[field] = {
					...item,
					error: new EnhancedError('must be specified', 'E_EMPTY'),
				};
			}
		}

		return fields;
	};

	_validateFields = (fields: Fields): Fields => {
		for (const field in fields) {
			const item = fields[field];

			switch (field) {
			case 'nick':
				if (item.value) {
					try {
						Validator.validate(item.value);
					} catch (e) {
						fields[field] = {
							...item,
							error: e,
						};
					}
				}
				break;
			}
		}

		return fields;
	};

	_onChangeField = (type: string, value: any) => {
		const fields = this._validateFields({ ...this.state.fields, [type]: { value, error: null } });

		this.setState({
			fields
		});
	};

	_saveData = (fields: Fields, page: string) => {
		if (this._hasErrors(fields, page)) {
			return;
		}

		switch (page) {
		case PAGE_USER_DETAILS:
			this.props.signUp(fields.nick, fields.name);
			break;
		case PAGE_PLACES:
			this.props.savePlaces(fields.places);
			break;
		case PAGE_GET_STARTED:
			this.setState({
				onboarding: false
			});
			break;
		}
	};

	_submitPage = (page: string): void => {
		const fields = this._ensureAllFields(this._validateFields({ ...this.state.fields }));

		this.setState({
			fields
		}, () => this._saveData(this.state.fields, page));
	};

	_submitUserDetails = (): void => this._submitPage(PAGE_USER_DETAILS);

	_submitPlaceDetails = (): void => this._submitPage(PAGE_PLACES);

	_submitGetStarted = (): void => this._submitPage(PAGE_GET_STARTED);

	render() {
		return (
			<Onboard
				{...this.props}
				{...this.state}
				canGoForward={this._hasErrors(this.state.fields, this.state.page)}
				submitUserDetails={this._submitUserDetails}
				submitPlaceDetails={this._submitPlaceDetails}
				submitGetStarted={this._submitGetStarted}
				onChangeField={this._onChangeField}
			/>
		);
	}
}

OnboardContainerInner.propTypes = {
	user: PropTypes.shape({
		id: PropTypes.string
	}).isRequired,
	pendingUser: PropTypes.shape({
		signedIdentities: PropTypes.string
	}).isRequired,
	signIn: PropTypes.func.isRequired,
	signUp: PropTypes.func.isRequired,
	cancelSignUp: PropTypes.func.isRequired,
	savePlaces: PropTypes.func.isRequired,
};

const OnboardContainer = Connect(({ user }) => ({
	user: {
		key: {
			slice: {
				type: 'entity',
				filter: {
					id: user
				}
			}
		},
	},
	pendingUser: {
		key: {
			type: 'state',
			path: 'signup',
		}
	},
}), {
	signIn: (props, store) => (provider: string, token: string) => store.setState(signIn(provider, token)),
	cancelSignUp: (props, store) => () => store.setState(cancelSignUp()),
	signUp: (props, store) => (id: string, name: string) => store.setState(signUp({ ...props.pendingUser, id, name })),
	savePlaces: (props, store) => places => {
		store.setState(saveUser({
			...props.user,
			params: {
				...props.user.params,
				places
			}
		}));
	},
})(OnboardContainerInner);

OnboardContainer.propTypes = {
	user: PropTypes.string.isRequired
};

export default OnboardContainer;
