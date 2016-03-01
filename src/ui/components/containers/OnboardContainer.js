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
	pendingUser: {
		signedIdentities: string;
		params: {
			picture?: string;
			name?: string
		}
	};
	signIn: Function;
	signUp: Function;
	cancelSignUp: Function;
	savePlaces: Function;
}

type Fields = {
	[key: string]: {
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
			nick: { value: '', error: null },
			name: { value: '', error: null },
			picture: { value: '', error: null },
			places: { value: [], error: null },
		},
		page: PAGE_LOADING,
		onboarding: false,
	};

	componentWillMount() {
		this._setCurrentPage(this.props);
	}

	componentWillReceiveProps(nextProps) {
		this._setUserDetails(nextProps);
		this._setCurrentPage(nextProps);
	}

	_setUserDetails = (props: Props) => {
		if (!props.pendingUser) {
			return;
		}

		const { params } = props.pendingUser;

		for (const provider in params) {
			const data = params[provider];

			if (data) {
				const { fields } = this.state;

				this.setState({
					fields: {
						...fields,
						name: { value: fields.name.value || data.name, error: null },
						picture: { value: fields.picture.value || data.picture, error: null },
					}
				});

				break;
			}
		}
	};

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
			if (user && user.type !== 'loading') {
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

	_isFieldRequired = (field: string) => {
		return [ 'nick', 'name', 'places' ].indexOf(field) > -1;
	};

	_getPageForField = (field: string) => {
		switch (field) {
		case 'nick':
		case 'name':
		case 'picture':
			return PAGE_USER_DETAILS;
		case 'places':
			return PAGE_PLACES;
		default:
			return PAGE_HOME;
		}
	};

	_canGoForward = (fields: Fields, page: string): boolean => {
		for (const field in fields) {
			const item = fields[field];

			if (this._getPageForField(field) === page && (item.error || this._isFieldRequired(field) && isEmpty(item.value))) {
				return false;
			}
		}

		return true;
	};

	_ensureAllFields = (fields: Fields): Fields => {
		for (const field in fields) {
			const item = fields[field];

			if (this._isFieldRequired(field) && isEmpty(item.value)) {
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
		if (!this._canGoForward(fields, page)) {
			return;
		}

		switch (page) {
		case PAGE_USER_DETAILS:
			this.props.signUp(fields.nick.value, fields.name.value);
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
				canGoForward={this._canGoForward(this.state.fields, this.state.page)}
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
	}),
	pendingUser: PropTypes.shape({
		signedIdentities: PropTypes.string,
		params: PropTypes.shape({
			name: PropTypes.string,
			picture: PropTypes.string
		})
	}),
	signIn: PropTypes.func.isRequired,
	signUp: PropTypes.func.isRequired,
	cancelSignUp: PropTypes.func.isRequired,
	savePlaces: PropTypes.func.isRequired,
};

const OnboardContainer = Connect(({ user }) => ({
	user: {
		key: {
			type: 'entity',
			id: user,
		},
	},
	pendingUser: {
		key: {
			type: 'state',
			path: 'signup',
		}
	},
	location: {
		key: {
			type: 'state',
			path: 'location'
		}
	}
}), {
	signIn: (props, store) => (provider: string, token: string) => store.dispatch(signIn(provider, token)),
	cancelSignUp: (props, store) => () => store.dispatch(cancelSignUp()),
	signUp: (props, store) => (id: string, name: string) => store.dispatch(signUp({ ...props.pendingUser, id, name })),
	savePlaces: (props, store) => places => {
		store.dispatch(saveUser({
			...props.user,
			params: {
				...props.user.params,
				places
			}
		}));
	},
})(OnboardContainerInner);

OnboardContainer.propTypes = {
	user: PropTypes.string
};

export default OnboardContainer;
