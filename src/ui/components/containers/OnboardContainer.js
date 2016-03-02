/* @flow */
/* eslint-disable react/no-multi-comp */

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

class OnboardContainer extends Component<void, Props, State> {
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

	componentWillReceiveProps(nextProps: Props) {
		this._setUserDetails(nextProps);
		this._setCurrentPage(nextProps);
	}

	_setUserDetails: Function = (props: Props) => {
		const {
			pendingUser
		} = props;

		if (!pendingUser) {
			return;
		}

		const { params } = pendingUser;

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

	_setCurrentPage: Function = (props: Props) => {
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
				if (user.profile && user.profile.places) {
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

	_isFieldRequired: Function = (field: string) => {
		return [ 'nick', 'name', 'places' ].indexOf(field) > -1;
	};

	_getPageForField: Function = (field: string) => {
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

	_canGoForward: Function = (fields: Fields, page: string): boolean => {
		for (const field in fields) {
			const item = fields[field];

			if (this._getPageForField(field) === page && (item.error || this._isFieldRequired(field) && isEmpty(item.value))) {
				return false;
			}
		}

		return true;
	};

	_ensureAllFields: Function = (fields: Fields): Fields => {
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

	_validateFields: Function = (fields: Fields): Fields => {
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

	_onChangeField: Function = (type: string, value: any) => {
		const fields = this._validateFields({ ...this.state.fields, [type]: { value, error: null } });

		this.setState({
			fields
		});
	};

	_saveData: Function = (fields: Fields, page: string) => {
		if (!this._canGoForward(fields, page)) {
			return;
		}

		switch (page) {
		case PAGE_USER_DETAILS:
			this.props.signUp(fields.nick.value, fields.name.value);
			break;
		case PAGE_PLACES:
			this.props.savePlaces(fields.places.value);
			break;
		case PAGE_GET_STARTED:
			this.setState({
				onboarding: false
			});
			break;
		}
	};

	_submitPage: Function = (page: string): void => {
		const fields = this._ensureAllFields(this._validateFields({ ...this.state.fields }));

		this.setState({
			fields
		}, () => this._saveData(this.state.fields, page));
	};

	_submitUserDetails: Function = (): void => this._submitPage(PAGE_USER_DETAILS);

	_submitPlaceDetails: Function = (): void => this._submitPage(PAGE_PLACES);

	_submitGetStarted: Function = (): void => this._submitPage(PAGE_GET_STARTED);

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

OnboardContainer.propTypes = {
	user: PropTypes.shape({
		id: PropTypes.string
	}),
	pendingUser: PropTypes.shape({
		params: PropTypes.object
	}),
	signIn: PropTypes.func.isRequired,
	signUp: PropTypes.func.isRequired,
	cancelSignUp: PropTypes.func.isRequired,
	savePlaces: PropTypes.func.isRequired,
};

const mapActionsToProps = {
	signIn: (store) => (provider: string, token: string) => store.dispatch(signIn(provider, token)),
	cancelSignUp: (store) => () => store.dispatch(cancelSignUp()),
	signUp: (store, result) => (id: string, name: string) => store.dispatch(signUp({ ...result.pendingUser, id, name })),
	savePlaces: (store, result) => places => {
		store.dispatch(saveUser({
			...result.user,
			profile: {
				...result.user.profile,
				places: places.map(p => p.placeId)
			}
		}));
	},
};

const OnboardContainerOuter = (props: any) => (
	<Connect
		mapActionsToProps={mapActionsToProps}
		mapSubscriptionToProps={{
			user: {
				key: {
					type: 'entity',
					id: props.user,
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
		}}
		component={OnboardContainer}
	/>
);

OnboardContainerOuter.propTypes = {
	user: PropTypes.string,
};

export default OnboardContainerOuter;
