/* @flow */

import React, { PropTypes, Component } from 'react';
import isEmpty from 'lodash/isEmpty';
import Connect from '../../../modules/store/Connect';
import SignUp from '../views/Onboard/SignUp';
import EnhancedError from '../../../lib/EnhancedError';
import Validator from '../../../lib/Validator';
import { signUp, saveUser } from '../../../modules/store/actions';
import type { User } from '../../../lib/schemaTypes';

type Props = {
	user: User;
	pendingUser: { signedIdentities: string };
	saveUser: Function;
	savePlaces: Function;
}

type Fields = {
	[key: string]: {
		page: number;
		value: any;
		error: ?EnhancedError
	};
}

type State = {
	fields: Fields
}

const PAGE_USER_DETAILS = 1;
const PAGE_PLACES = 2;

class SignUpContainerInner extends Component<void, Props, State> {
	state: State = {
		fields: {
			nick: { page: PAGE_USER_DETAILS, value: '', error: null },
			name: { page: PAGE_USER_DETAILS, value: '', error: null },
			places: { page: PAGE_PLACES, value: [], error: null },
		}
	};

	_hasErrors = (fields: Fields, page: number): boolean => {
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

	_saveData = (fields: Fields, page: number) => {
		if (this._hasErrors(fields, page)) {
			return;
		}

		switch (page) {
		case PAGE_USER_DETAILS:
			this.props.saveUser(fields.nick, fields.name);
			break;
		case PAGE_PLACES:
			this.props.savePlaces(fields.places);
			break;
		}
	};

	_submitPage = (page: number): void => {
		const fields = this._ensureAllFields(this._validateFields({ ...this.state.fields }));

		this.setState({
			fields
		}, () => this._saveData(this.state.fields, page));
	};

	_submitUserDetails = (): void => this._submitPage(PAGE_USER_DETAILS);

	_submitPlaceDetails = (): void => this._submitPage(PAGE_PLACES);

	render() {
		return (
			<SignUp
				{...this.props}
				{...this.state}
				submitUserDetails={this._submitUserDetails}
				submitPlaceDetails={this._submitPlaceDetails}
				onChangeField={this._onChangeField}
			/>
		);
	}
}

SignUpContainerInner.propTypes = {
	user: PropTypes.shape({
		id: PropTypes.string
	}).isRequired,
	pendingUser: PropTypes.shape({
		signedIdentities: PropTypes.string
	}).isRequired,
	saveUser: PropTypes.func.isRequired,
	savePlaces: PropTypes.func.isRequired
};

const SignUpContainer = Connect(({ user }) => ({
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
			type: 'app',
			path: 'signUp',
		}
	},
}), {
	saveUser: (props, store) => (id: string, name: string) => {
		store.setState(signUp({ ...props.pendingUser, id, name }));
	},
	savePlaces: (props, store) => places => {
		store.setState(saveUser({
			...props.user,
			params: {
				...props.user.params,
				places
			}
		}));
	},
})(SignUpContainerInner);

SignUpContainer.propTypes = {
	user: PropTypes.string.isRequired
};

export default SignUpContainer;
